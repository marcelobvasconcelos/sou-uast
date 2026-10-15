import { prisma } from './prisma';
import { CategoryWithItems } from '@/types';

/**
 * Busca todas as categorias ativas e seus itens de menu ordenados para o menu em cascata institucional
 */
export async function getPublicMenuCategories(): Promise<CategoryWithItems[]> {
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
                page: {
                  select: { slug: true },
                },
              },
            },
          },
        },
      },
    });

    return rawCategories.map((cat) => ({
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
  } catch (error) {
    console.error('Erro ao buscar categorias e itens do menu institucional:', error);
    return [];
  }
}
