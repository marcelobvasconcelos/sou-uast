import React from 'react';
import { prisma } from '@/lib/prisma';
import SettingsForm from './SettingsForm';

export const metadata = {
  title: 'Configurações do Portal | Painel SOU+UAST',
};

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: 'site_settings' },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-ufrpe-blue-900">
          Configurações Institucionais do Portal
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Edite a identidade visual, logos, textos institucionais, rodapé no padrão UAST, redes sociais, LGPD e regras de segurança.
        </p>
      </div>

      <SettingsForm initialSettings={settings || undefined} />
    </div>
  );
}
