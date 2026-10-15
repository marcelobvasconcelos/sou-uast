import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { NewsCardData } from '@/types';

interface RecentNewsProps {
  news: NewsCardData[];
}

export default function RecentNews({ news }: RecentNewsProps) {
  if (!news || news.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8" aria-labelledby="recent-news-heading">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b-2 border-ufrpe-blue-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-ufrpe-green-700 font-bold text-sm uppercase tracking-wider mb-1">
            <Newspaper className="w-4 h-4" />
            <span>Acontece no SOU+UAST</span>
          </div>
          <h2 id="recent-news-heading" className="text-2xl sm:text-3xl font-extrabold text-ufrpe-blue-900">
            Notícias Recentes &amp; Comunicados
          </h2>
        </div>
        <Link
          href="/noticias"
          className="inline-flex items-center gap-2 text-sm font-bold text-ufrpe-blue-800 hover:text-ufrpe-green-700 transition focus:outline-none focus:ring-2 focus:ring-ufrpe-blue-700 rounded px-2 py-1"
        >
          <span>Ver todas as notícias</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid de Cards de Notícias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {news.map((item) => (
            <article
              key={item.id}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full focus-within:ring-2 focus-within:ring-ufrpe-blue-700"
            >
              {/* Miniatura com Link */}
              <Link
                href={`/noticias/${item.slug}`}
                className="relative aspect-video w-full overflow-hidden bg-gray-100 block"
                tabIndex={-1}
                aria-hidden="true"
              >
                <Image
                  src={item.featuredImage || '/images/news/noticia-1.svg'}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
              </Link>

              {/* Corpo do Card */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2.5">
                  <Calendar className="w-3.5 h-3.5 text-ufrpe-green-600" />
                  <time dateTime={new Date(item.publishedAt).toISOString()}>
                    {formatDate(item.publishedAt)}
                  </time>
                  {item.isFeatured && (
                    <span className="ml-auto inline-block px-2 py-0.5 text-[10px] font-bold bg-ufrpe-green-100 text-ufrpe-green-800 rounded">
                      Destaque
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 group-hover:text-ufrpe-blue-800 transition line-clamp-2 mb-2 leading-snug">
                  <Link
                    href={`/noticias/${item.slug}`}
                    className="focus:outline-none focus:underline"
                  >
                    {item.title}
                  </Link>
                </h3>

                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow leading-relaxed">
                  {item.summary}
                </p>

                <div className="pt-2 border-t border-gray-100 mt-auto">
                  <Link
                    href={`/noticias/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-ufrpe-blue-800 group-hover:text-ufrpe-green-700 group-hover:translate-x-1 transition-all"
                  >
                    <span>Ler matéria na íntegra</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
    </section>
  );
}
