import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, Share2, ArrowLeft, ArrowRight } from 'lucide-react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { formatDate, estimateReadingTime } from '@/lib/utils';
import { Metadata } from 'next';
import { getAssetUrl } from '@/lib/api-client';

interface NewsDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const news = await prisma.news.findUnique({
    where: { slug: params.slug },
  });

  if (!news) {
    return {
      title: 'Notícia não encontrada',
    };
  }

  return {
    title: news.title,
    description: news.summary,
    openGraph: {
      title: news.title,
      description: news.summary,
      type: 'article',
      publishedTime: new Date(news.publishedAt).toISOString(),
      images: [
        {
          url: news.featuredImage || '/images/news/noticia-1.svg',
          alt: news.title,
        },
      ],
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const news = await prisma.news.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!news || news.status !== 'PUBLISHED') {
    notFound();
  }

  // Notícias recomendadas (outras notícias recentes)
  const relatedNews = await prisma.news.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: news.id },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      featuredImage: true,
      publishedAt: true,
      summary: true,
    },
  });

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Notícias', href: '/noticias' },
          { label: news.title },
        ]}
      />

      <article className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10">
        {/* Cabeçalho da Notícia */}
        <header className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500">
            <span className="bg-ufrpe-green-100 text-ufrpe-green-800 font-bold px-2.5 py-0.5 rounded-full">
              Extensão UAST
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-ufrpe-green-700" />
              <time dateTime={new Date(news.publishedAt).toISOString()}>
                {formatDate(news.publishedAt)}
              </time>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span>{estimateReadingTime(news.content)}</span>
            </span>
            {news.author?.name && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-ufrpe-blue-700" />
                  <span>Por {news.author.name}</span>
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-ufrpe-blue-900 tracking-tight leading-tight">
            {news.title}
          </h1>

          {/* Lead / Resumo em Destaque */}
          <div className="p-4 bg-slate-50 border-l-4 border-ufrpe-green-600 rounded-r-lg">
            <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed">
              {news.summary}
            </p>
          </div>
        </header>

        {/* Imagem de Capa Principal */}
        {news.featuredImage && (
          <figure className="my-8 rounded-2xl overflow-hidden shadow-lg bg-gray-100 border border-gray-200">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={getAssetUrl(news.featuredImage)}
                alt={news.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          </figure>
        )}

        {/* Corpo Rico da Matéria */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-ufrpe-blue-900 prose-headings:font-bold prose-a:text-ufrpe-blue-700 hover:prose-a:text-ufrpe-green-700 prose-img:rounded-xl prose-img:shadow-md pt-4 border-t border-gray-100"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {/* Rodapé da Matéria com Compartilhamento */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 text-sm font-bold text-ufrpe-blue-800 hover:text-ufrpe-green-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para todas as notícias</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <Share2 className="w-4 h-4" />
            <span>Compartilhe:</span>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(news.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
              title="Compartilhar no WhatsApp"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              title="Compartilhar no Facebook"
            >
              Facebook
            </a>
          </div>
        </div>

        {/* Notícias Relacionadas / Recomendadas */}
        {relatedNews.length > 0 && (
          <aside className="mt-16 pt-10 border-t-2 border-ufrpe-blue-800">
            <h2 className="text-2xl font-bold text-ufrpe-blue-900 mb-6">
              Outras Notícias da UAST
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/noticias/${item.slug}`}
                  className="group bg-white p-3 rounded-xl border hover:shadow-md transition flex flex-col"
                >
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 mb-3">
                    <Image
                      src={getAssetUrl(item.featuredImage || '/images/news/noticia-1.svg')}
                      alt=""
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <time className="text-[11px] text-gray-500 mb-1 block">
                    {formatDate(item.publishedAt)}
                  </time>
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-ufrpe-blue-800 line-clamp-2">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </article>
    </div>
  );
}
