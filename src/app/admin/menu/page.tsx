import React from 'react';
import MenuManager from '@/components/admin/MenuManager';
import { prisma } from '@/lib/prisma';
import { CategoryWithItems } from '@/types';

export const metadata = {
  title: 'Menu em Cascata | Painel SOU+UAST',
};

export const dynamic = 'force-dynamic';

export default async function AdminMenuPage() {
  // Buscar todas as categorias com itens e subitens ordenados
  const rawCategories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      menuItems: {
        orderBy: { order: 'asc' },
        include: {
          page: { select: { slug: true } },
          children: {
            orderBy: { order: 'asc' },
            include: {
              page: { select: { slug: true } },
            },
          },
        },
      },
    },
  });

  const categories: CategoryWithItems[] = rawCategories.map((cat) => ({
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

  // Buscar páginas disponíveis para associação com os links
  const pages = await prisma.page.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
    orderBy: { title: 'asc' },
  });

  return (
    <div>
      <MenuManager initialCategories={categories} availablePages={pages} />
    </div>
  );
}
