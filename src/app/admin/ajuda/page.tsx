import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getHelpSectionsForRole } from '@/content/help';
import HelpView from '@/components/help/HelpView';

export const metadata = {
  title: 'Central de Ajuda | Painel SOU+UAST',
  description: 'Orientações e instruções de operação do sistema SOU+UAST por perfil de acesso.',
};

export const dynamic = 'force-dynamic';

export default async function AdminHelpPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/admin/ajuda');
  }

  const role = session.user.role || 'EDITOR';
  // Filtragem estrita no servidor conforme o perfil do usuário logado
  const filteredSections = getHelpSectionsForRole(role);

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <HelpView sections={filteredSections} role={role} isPublic={false} />
    </div>
  );
}
