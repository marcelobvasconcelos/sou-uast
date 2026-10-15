import React from 'react';
import DrupalNewsEditor from '@/components/admin/DrupalNewsEditor';

export const metadata = {
  title: 'Cadastrar Nova Notícia | Painel SOU+UAST',
};

export default function NovaNoticiaPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ufrpe-blue-900">
          Cadastrar Nova Notícia
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Experiência unificada estilo Drupal: preencha os dados, salve como rascunho ou visualize antes de publicar.
        </p>
      </div>

      <DrupalNewsEditor isEditing={false} />
    </div>
  );
}
