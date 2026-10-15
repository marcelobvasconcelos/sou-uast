import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Search, ArrowRight, Newspaper } from 'lucide-react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { prisma } from '@/lib/prisma';
import { formatDate, estimateReadingTime } from '@/lib/utils';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notícias & Comunicados',
  description: 'Acompanhe as últimas notícias, projetos, eventos e visitas da UAST/UFRPE e do projeto SOU+UAST.',
};

export const dynamic = 'force-dynamic';

interface NoticiasPageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export default async function NoticiasPage({ searchParams }: NoticiasPageProps) {
  const query = searchParams.q?.trim() || '';
  const currentPage = Math.max(1, parseInt(searchParams.page || '1', 10));
  const pageSize = 9;

  const whereClause: any = {
    status: 'PUBLISHED',
  };

  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { summary: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } },
    ];
  }

  let totalCount = 0;
  let newsList: any[] = [];

  try {
    totalCount = await prisma.news.count({ where: whereClause });
    newsList = await prisma.news.findMany({
      where: whereClause,
      orderBy: { publishedAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        featuredImage: true,
        isFeatured: true,
        publishedAt: true,
        content: true,
      },
    });
  } catch (err) {
    console.error('Erro ao listar notícias:', err);
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      <Breadcrumb items={[{ label: 'Notícias e Comunicados' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Cabeçalho da Página com Campo de Busca */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-ufrpe-green-700 font-bold text-xs uppercase tracking-wider mb-1.5">
              <Newspaper className="w-4 h-4" />
              <span>Portal de Comunicação</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ufrpe-blue-900 tracking-tight">
              Todas as Notícias &amp; Comunicados
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Fique por dentro das ações de extensão, oficinas e oportunidades da UAST/UFRPE.
            </p>
          </div>

          {/* Formulário de Busca */}
          <form method="GET" action="/noticias" className="w-full md:w-80">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Buscar notícias..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ufrpe-blue-700 bg-white"
                aria-label="Buscar notícias"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </form>
        </div>

        {/* Feedback de busca */}
        {query && (
          <div className="py-4 text-sm text-gray-600 flex items-center justify-between">
            <p>
              Exibindo resultados para: <strong className="text-gray-900">"{query}"</strong> ({totalCount} notícias encontradas)
            </p>
            <Link href="/noticias" className="text-ufrpe-blue-700 font-semibold hover:underline text-xs">
              Limpar busca
            </Link>
          </div>
        )}

        {/* Lista / Grid de Notícias */}
        {newsList.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-gray-200 my-8">
            <p className="text-gray-500 font-medium">Nenhuma notícia encontrada com os termos informados.</p>
            {query && (
              <Link href="/noticias" className="inline-block mt-3 text-sm text-ufrpe-blue-700 font-bold hover:underline">
                Ver todas as notícias disponíveis
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-8">
            {newsList.map((item) => (
              <article
                key={item.id}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full focus-within:ring-2 focus-within:ring-ufrpe-blue-700"
              >
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

                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-ufrpe-green-700" />
                      <time dateTime={new Date(item.publishedAt).toISOString()}>
                        {formatDate(item.publishedAt)}
                      </time>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-yellow-600" />
                      <span>{estimateReadingTime(item.content)}</span>
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-ufrpe-blue-800 transition line-clamp-2 mb-2 leading-snug">
                    <Link href={`/noticias/${item.slug}`} className="focus:outline-none focus:underline">
                      {item.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="pt-3 border-t border-gray-100 mt-auto">
                    <Link
                      href={`/noticias/${item.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-ufrpe-blue-800 group-hover:text-ufrpe-green-700 transition"
                    >
                      <span>Acessar notícia completa</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-8 border-t border-gray-200">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/noticias?${query ? `q=${encodeURIComponent(query)}&` : ''}page=${pageNum}`}
                className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition ${
                  currentPage === pageNum
                    ? 'bg-ufrpe-blue-800 text-white shadow'
                    : 'bg-white border text-gray-700 hover:bg-slate-100'
                }`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
