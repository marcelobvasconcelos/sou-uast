import React from 'react';
import PageBlocksEditor from '@/components/admin/PageBlocksEditor';

export const metadata = {
  title: 'Criar Página Institucional | Painel SOU+UAST',
};

export default function NovaPaginaPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ufrpe-blue-900">
          Criar Página Institucional
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Adicione título, banner opcional e monte o conteúdo empilhando blocos de texto, imagem, vídeo ou HTML.
        </p>
      </div>

      <PageBlocksEditor isEditing={false} />
    </div>
  );
}
