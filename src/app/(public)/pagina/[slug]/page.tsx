import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Breadcrumb from '@/components/layout/Breadcrumb';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { getAssetUrl } from '@/lib/api-client';

interface PageDynamicProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageDynamicProps): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
  });

  if (!page) {
    return { title: 'Página não encontrada' };
  }

  return {
    title: page.title,
    description: page.subtitle || `Página institucional do projeto SOU+UAST - UAST/UFRPE.`,
    openGraph: {
      title: page.title,
      description: page.subtitle || undefined,
      images: page.bannerImage ? [{ url: page.bannerImage }] : undefined,
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function PageDynamic({ params }: PageDynamicProps) {
  // 1. Buscar a Página com seus Blocos Ordenados
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!page || page.status !== 'PUBLISHED') {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Institucional' },
          { label: page.title },
        ]}
      />

      {/* Área Central: Modelo Padrão de Página */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-sm">
        {/* Banner Opcional Superior */}
        {page.bannerImage && (
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full rounded-xl overflow-hidden shadow mb-8 bg-gray-100">
            <Image
              src={getAssetUrl(page.bannerImage)}
              alt={page.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        )}

        {/* Cabeçalho da Página */}
        <header className="mb-8 pb-6 border-b border-gray-200 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ufrpe-blue-900 tracking-tight leading-tight">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
              {page.subtitle}
            </p>
          )}
        </header>

        {/* Pilha de Blocos de Conteúdo Ordenáveis */}
        <BlockRenderer blocks={page.blocks as any} />
      </div>
    </div>
  );
}
