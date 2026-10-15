import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import UsersManager from './UsersManager';

export const metadata = {
  title: 'Usuários e Permissões | Painel SOU+UAST',
};

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'ADMIN') {
    redirect('/admin');
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { news: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-ufrpe-blue-900">
          Usuários &amp; Controle de Acesso (RBAC)
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Gerencie editores de conteúdo e administradores institucionais do portal SOU+UAST.
        </p>
      </div>

      <UsersManager initialUsers={users as any} currentUserId={session.user.id} />
    </div>
  );
}
