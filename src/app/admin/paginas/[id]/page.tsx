import React from 'react';
import { notFound } from 'next/navigation';
import PageBlocksEditor from '@/components/admin/PageBlocksEditor';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Editar Blocos da Página | Painel SOU+UAST',
};

export const dynamic = 'force-dynamic';

export default async function EditarPaginaPage({ params }: { params: { id: string } }) {
  const page = await prisma.page.findUnique({
    where: { id: params.id },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!page) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ufrpe-blue-900">
          Editar Página: {page.title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Reordene, adicione, duplique ou exclua os blocos desta página institucional.
        </p>
      </div>

      <PageBlocksEditor
        isEditing={true}
        pageId={page.id}
        initialTitle={page.title}
        initialSlug={page.slug}
        initialSubtitle={page.subtitle || ''}
        initialBannerImage={page.bannerImage || ''}
        initialStatus={page.status}
        initialBlocks={page.blocks as any}
      />
    </div>
  );
}
