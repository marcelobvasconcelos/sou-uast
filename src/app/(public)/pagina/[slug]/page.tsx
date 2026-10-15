import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Breadcrumb from '@/components/layout/Breadcrumb';
import CascadeSidebar from '@/components/layout/CascadeSidebar';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { CategoryWithItems } from '@/types';

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

  // 2. Buscar Categorias e Itens do Menu em Cascata
  let categories: CategoryWithItems[] = [];
  try {
    const rawCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        menuItems: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            page: {
              select: { slug: true },
            },
            children: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
              include: {
                page: { select: { slug: true } },
              },
            },
          },
        },
      },
    });

    categories = rawCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      order: cat.order,
      isActive: cat.isActive,
      menuItems: cat.menuItems.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        pageId: item.pageId,
        pageSlug: item.page?.slug || null,
        categoryId: item.categoryId,
        parentId: item.parentId,
        order: item.order,
        isActive: item.isActive,
        openInNewTab: item.openInNewTab,
        children: item.children?.map((child) => ({
          id: child.id,
          title: child.title,
          url: child.url,
          pageId: child.pageId,
          pageSlug: child.page?.slug || null,
          categoryId: child.categoryId,
          parentId: child.parentId,
          order: child.order,
          isActive: child.isActive,
          openInNewTab: child.openInNewTab,
        })),
      })),
    }));
  } catch (err) {
    console.error('Erro ao carregar menu lateral:', err);
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Institucional' },
          { label: page.title },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Menu Lateral Esquerdo em Cascata (Item 6) */}
          <CascadeSidebar categories={categories} currentSlug={params.slug} />

          {/* Área Central: Modelo Padrão de Página (Item 7 e 8) */}
          <div className="flex-grow w-full max-w-4xl bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-sm">
            {/* Banner Opcional Superior */}
            {page.bannerImage && (
              <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full rounded-xl overflow-hidden shadow mb-8 bg-gray-100">
                <Image
                  src={page.bannerImage}
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

            {/* Pilha de Blocos de Conteúdo Ordenáveis (Item 7 e 8) */}
            <BlockRenderer blocks={page.blocks as any} />
          </div>
        </div>
      </div>
    </div>
  );
}
