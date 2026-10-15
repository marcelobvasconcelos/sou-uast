import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import {
  Newspaper,
  Plus,
  Sparkles,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react';
import DeleteNewsButton from './DeleteNewsButton';

export const dynamic = 'force-dynamic';

export default async function AdminNewsPage() {
  const news = await prisma.news.findMany({
    orderBy: { publishedAt: 'desc' },
    include: {
      author: {
        select: { name: true },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-ufrpe-blue-900 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-ufrpe-green-700" />
            <span>Gerenciamento de Notícias e Destaques</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Cadastre, edite rascunhos, publique e escolha as notícias destacadas no carrossel.
          </p>
        </div>

        <Link
          href="/admin/noticias/nova"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ufrpe-green-700 hover:bg-ufrpe-green-800 text-white rounded-lg text-sm font-bold shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Notícia</span>
        </Link>
      </div>

      {/* Tabela de Notícias */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-gray-700 border-b border-gray-200">
              <tr>
                <th className="p-4">Capa</th>
                <th className="p-4">Título / Lead</th>
                <th className="p-4 text-center">Carrossel</th>
                <th className="p-4">Status</th>
                <th className="p-4">Publicação</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {news.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                    Nenhuma notícia cadastrada. Clique no botão acima para criar a primeira.
                  </td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    {/* Capa */}
                    <td className="p-4 w-24">
                      <div className="relative aspect-video w-20 rounded bg-gray-100 overflow-hidden border">
                        {item.featuredImage ? (
                          <Image
                            src={item.featuredImage}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                            Sem capa
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Título */}
                    <td className="p-4 max-w-md">
                      <Link
                        href={`/admin/noticias/${item.id}`}
                        className="font-bold text-gray-900 hover:text-ufrpe-blue-800 line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.summary}</p>
                    </td>

                    {/* Destaque Carrossel */}
                    <td className="p-4 text-center">
                      {item.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ufrpe-green-800 bg-ufrpe-green-100 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" />
                          Sim
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Não</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {item.status === 'PUBLISHED' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Publicado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                          <Clock className="w-3.5 h-3.5" />
                          Rascunho
                        </span>
                      )}
                    </td>

                    {/* Data */}
                    <td className="p-4 text-xs whitespace-nowrap">
                      {formatDate(item.publishedAt)}
                    </td>

                    {/* Ações */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'PUBLISHED' && (
                          <Link
                            href={`/noticias/${item.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-ufrpe-blue-800 rounded hover:bg-slate-100"
                            title="Ver notícia no portal público"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/noticias/${item.id}`}
                          className="p-1.5 text-gray-600 hover:text-ufrpe-blue-800 rounded hover:bg-slate-100"
                          title="Editar notícia"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteNewsButton id={item.id} title={item.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
