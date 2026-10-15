import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// Detectar protocolo e host públicos
const publicUrl =
  process.env.PUBLIC_BASE_URL ||
  process.env.NEXTAUTH_URL ||
  process.env.AUTH_URL ||
  'http://localhost:3000';

const isHttps = publicUrl.startsWith('https://');

// Configuração dinâmica de cookies de sessão:
// 1. Em HTTP puro (como o IP interno http://172.16.68.50:97), secure DEVE ser false para que o navegador não descarte o cookie.
// 2. Quando a STI configurar o proxy reverso com certificado TLS/HTTPS, secure se torna true automaticamente.
const useSecureCookies = isHttps;
const cookiePrefix = useSecureCookies ? '__Secure-' : '';
const hostPrefix = useSecureCookies ? '__Host-' : '';

export const authOptions: AuthOptions = {
  useSecureCookies,
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${hostPrefix}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
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
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-sou-uast-institutional-key-2025',
};

// Suporte a trustHost para compatibilidade com Auth.js / NextAuth atrás de proxy reverso
(authOptions as any).trustHost = true;
