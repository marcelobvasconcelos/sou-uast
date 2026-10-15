import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  // Rotas estáticas fixas
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/noticias`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pagina/acessibilidade`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  try {
    // Páginas institucionais dinâmicas publicadas
    const pages = await prisma.page.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    const pageRoutes: MetadataRoute.Sitemap = pages.map((p) => ({
      url: `${baseUrl}/pagina/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Notícias publicadas
    const news = await prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    const newsRoutes: MetadataRoute.Sitemap = news.map((n) => ({
      url: `${baseUrl}/noticias/${n.slug}`,
      lastModified: n.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...pageRoutes, ...newsRoutes];
  } catch {
    return staticRoutes;
  }
}
