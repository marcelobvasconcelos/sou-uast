import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// Resolver basePath configurado (ex: '/soumaisuast')
const rawBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || process.env.BASE_PATH || '').replace(/\/+$/, '');
const authBasePath = rawBasePath === '/' || !rawBasePath ? '' : (rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`);

export const authOptions: AuthOptions = {
  // Desativar prefixos restritivos __Host- e __Secure- para garantir compatibilidade
  // com acesso via IP direto HTTP (http://172.16.68.50:97) e via proxy reverso HTTPS (https://www.uast.ufrpe.br)
  useSecureCookies: false,
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'E-mail', type: 'email', placeholder: 'seu.email@ufrpe.br' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-mail e senha são obrigatórios.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
        }

        if (!user.isActive) {
          throw new Error('Usuário inativo. Entre em contato com a administração.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
        }

        // Garantir que o papel seja válido (ADMIN ou EDITOR). Se for criado manualmente sem papel, define EDITOR por segurança
        const safeRole = user.role && ['ADMIN', 'EDITOR'].includes(user.role) ? user.role : 'EDITOR';

        // Registrar log de login simples
        try {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
              action: 'LOGIN',
              entityType: 'Autenticação',
              details: `Usuário ${user.email} (${safeRole}) realizou login com sucesso no painel administrativo.`,
            },
          });
        } catch {
          // Log silencioso se falhar para não bloquear o login
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: safeRole,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Se for URL relativa começando com '/'
      if (url.startsWith('/')) {
        if (authBasePath && url.startsWith(authBasePath)) {
          return `${baseUrl}${url}`;
        }
        return `${baseUrl}${authBasePath}${url}`;
      }

      // Se for URL absoluta
      try {
        const parsedUrl = new URL(url);
        const parsedBase = new URL(baseUrl);
        const hostMatches =
          parsedUrl.host === parsedBase.host ||
          parsedUrl.host.replace(/^www\./, '') === parsedBase.host.replace(/^www\./, '');

        if (hostMatches) {
          if (authBasePath && !parsedUrl.pathname.startsWith(authBasePath)) {
            parsedUrl.pathname = `${authBasePath}${parsedUrl.pathname}`;
          }
          return parsedUrl.toString();
        }
      } catch {}

      // Fallback padrão: direciona para o painel administrativo da aplicação
      if (authBasePath) {
        return `${baseUrl}${authBasePath}/admin`;
      }
      return `${baseUrl}/admin`;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: authBasePath ? `${authBasePath}/login` : '/login',
    error: authBasePath ? `${authBasePath}/login` : '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-sou-uast-institutional-key-2025',
};

// Suporte a trustHost para compatibilidade com Auth.js / NextAuth atrás de proxy reverso
(authOptions as any).trustHost = true;
