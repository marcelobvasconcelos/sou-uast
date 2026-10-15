import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TeamManager from './TeamManager';

export const metadata = {
  title: 'Equipe do Projeto | Painel SOU+UAST',
};

export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin/login');
  }

  const members = await prisma.teamMember.findMany({
    orderBy: [
      { order: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-ufrpe-blue-900">
          Equipe do Projeto SOU+UAST
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Cadastre, edite, reordene e gerencie os docentes, servidores técnico-administrativos e estudantes bolsistas que integram o projeto de extensão.
        </p>
      </div>

      <TeamManager
        initialMembers={members as any}
        currentUserRole={session.user.role}
      />
    </div>
  );
}
