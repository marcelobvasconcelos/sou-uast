import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: AuthOptions = {
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

        // Registrar log de login simples
        try {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
              action: 'LOGIN',
              entityType: 'Autenticação',
              details: `Usuário realizou login com sucesso no painel administrativo.`,
            },
          });
        } catch {
          // Log silencioso se falhar para não bloquear o login
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
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
