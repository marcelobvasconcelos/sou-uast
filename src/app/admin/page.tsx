import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  Newspaper,
  Sparkles,
  FileText,
  Layers,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Buscar métricas agregadas
  const [newsCount, featuredCount, draftCount, pagesCount, categoriesCount, recentNews] = await Promise.all([
    prisma.news.count({ where: { status: 'PUBLISHED' } }),
    prisma.news.count({ where: { status: 'PUBLISHED', isFeatured: true, featuredImage: { not: null } } }),
    prisma.news.count({ where: { status: 'DRAFT' } }),
    prisma.page.count(),
    prisma.category.count(),
    prisma.news.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        isFeatured: true,
        updatedAt: true,
      },
    }),
  ]);

  const stats = [
    {
      label: 'Notícias Publicadas',
      value: newsCount,
      icon: Newspaper,
      color: 'bg-blue-50 text-ufrpe-blue-800 border-ufrpe-blue-200',
    },
    {
      label: 'Destaques no Carrossel',
      value: `${featuredCount}/3`,
      icon: Sparkles,
      color: 'bg-green-50 text-ufrpe-green-800 border-ufrpe-green-200',
      hint: featuredCount > 3 ? 'Exibindo os 3 mais recentes' : 'Ativos na Home',
    },
    {
      label: 'Rascunhos Salvos',
      value: draftCount,
      icon: Clock,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      label: 'Páginas Institucionais',
      value: pagesCount,
      icon: FileText,
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Banner de Boas-vindas */}
      <div className="bg-gradient-to-r from-ufrpe-blue-900 to-ufrpe-blue-800 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-ufrpe-green-600 text-white mb-2">
            Painel SOU+UAST
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Olá, {session?.user?.name || 'Colega'}!
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Gerencie notícias, carrossel de destaques, páginas com blocos, menus e configurações institucionais da UAST/UFRPE.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/noticias/nova"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-ufrpe-green-700 hover:bg-ufrpe-green-800 text-white rounded-lg text-sm font-bold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Notícia (Drupal)</span>
          </Link>
          <Link
            href="/admin/paginas/nova"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-ufrpe-blue-900 hover:bg-slate-100 rounded-lg text-sm font-bold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Página</span>
          </Link>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-xl border bg-white shadow-sm flex items-center justify-between`}
            >
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
                {stat.hint && <p className="text-[11px] text-gray-400 mt-0.5">{stat.hint}</p>}
              </div>
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção Dupla: Ações Rápidas & Últimos Conteúdos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna 1: Ações Rápidas de Publicação */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-ufrpe-blue-900">
            Ações Rápidas de Conteúdo
          </h2>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <Link
              href="/admin/noticias/nova"
              className="flex items-center justify-between p-3.5 rounded-lg border border-gray-200 hover:border-ufrpe-blue-600 hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-ufrpe-blue-700">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-ufrpe-blue-800">
                    Cadastrar Notícia
                  </h3>
                  <p className="text-xs text-gray-500">Formulário único com pré-visualização e destaque</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-ufrpe-blue-700 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/admin/paginas/nova"
              className="flex items-center justify-between p-3.5 rounded-lg border border-gray-200 hover:border-ufrpe-blue-600 hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50 text-ufrpe-green-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-ufrpe-blue-800">
                    Criar Página Dinâmica
                  </h3>
                  <p className="text-xs text-gray-500">Modelo padrão com blocos ordenáveis</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-ufrpe-blue-700 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/admin/menu"
              className="flex items-center justify-between p-3.5 rounded-lg border border-gray-200 hover:border-ufrpe-blue-600 hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-ufrpe-blue-800">
                    Organizar Menu Cascata
                  </h3>
                  <p className="text-xs text-gray-500">Categorias e links exibidos nas páginas internas</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-ufrpe-blue-700 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>

        {/* Coluna 2: Últimas Notícias Editadas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ufrpe-blue-900">
              Notícias Recentes no Painel
            </h2>
            <Link
              href="/admin/noticias"
              className="text-xs font-semibold text-ufrpe-blue-700 hover:underline"
            >
              Ver todas ({newsCount + draftCount}) →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {recentNews.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] rounded font-bold ${
                          item.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                      </span>
                      {item.isFeatured && (
                        <span className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-ufrpe-blue-100 text-ufrpe-blue-800 font-bold">
                          Destaque
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/admin/noticias/${item.id}`}
                      className="font-bold text-sm text-gray-800 hover:text-ufrpe-blue-800 block truncate max-w-md"
                    >
                      {item.title}
                    </Link>
                    <span className="text-[11px] text-gray-400 block">
                      Atualizado em {formatDate(item.updatedAt)}
                    </span>
                  </div>

                  <Link
                    href={`/admin/noticias/${item.id}`}
                    className="text-xs font-semibold px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-ufrpe-blue-50 hover:text-ufrpe-blue-800 transition whitespace-nowrap"
                  >
                    Editar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
