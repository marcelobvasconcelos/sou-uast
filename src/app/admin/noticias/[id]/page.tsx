import React from 'react';
import { notFound } from 'next/navigation';
import DrupalNewsEditor from '@/components/admin/DrupalNewsEditor';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Editar Notícia | Painel SOU+UAST',
};

export const dynamic = 'force-dynamic';

export default async function EditarNoticiaPage({ params }: { params: { id: string } }) {
  const news = await prisma.news.findUnique({
    where: { id: params.id },
  });

  if (!news) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ufrpe-blue-900">
          Editar Notícia
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Altere o conteúdo, imagem de capa, status de publicação e destaque no carrossel.
        </p>
      </div>

      <DrupalNewsEditor
        isEditing={true}
        initialData={{
          id: news.id,
          title: news.title,
          slug: news.slug,
          summary: news.summary,
          content: news.content,
          featuredImage: news.featuredImage || '',
          isFeatured: news.isFeatured,
          status: news.status,
          publishedAt: new Date(news.publishedAt).toISOString(),
        }}
      />
    </div>
  );
}
