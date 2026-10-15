import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getHelpSectionsForRole } from '@/content/help';
import HelpView from '@/components/help/HelpView';

export const metadata = {
  title: 'Ajuda e Informações | SOU+UAST',
  description: 'Informações sobre o funcionamento e perfis de acesso do portal institucional SOU+UAST.',
};

export const dynamic = 'force-dynamic';

export default async function PublicHelpPage() {
  const session = await getServerSession(authOptions);
  const visitorSections = getHelpSectionsForRole('VISITOR');

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <HelpView
          sections={visitorSections}
          role={session?.user?.role || 'VISITOR'}
          isPublic={true}
        />
      </div>
    </div>
  );
}
