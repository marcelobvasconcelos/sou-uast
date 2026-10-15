import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  Plus,
  Layers,
  Edit,
  ExternalLink,
  CheckCircle2,
  Clock
} from 'lucide-react';
import DeletePageButton from './DeletePageButton';

export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { blocks: true },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-ufrpe-blue-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-ufrpe-green-700" />
            <span>Páginas Institucionais Dinâmicas</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Crie e estruture páginas institucionais utilizando o modelo padrão de blocos ordenáveis.
          </p>
        </div>

        <Link
          href="/admin/paginas/nova"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ufrpe-green-700 hover:bg-ufrpe-green-800 text-white rounded-lg text-sm font-bold shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Página</span>
        </Link>
      </div>

      {/* Tabela de Páginas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-gray-700 border-b border-gray-200">
              <tr>
                <th className="p-4">Título / URL</th>
                <th className="p-4 text-center">Blocos</th>
                <th className="p-4">Status</th>
                <th className="p-4">Última Atualização</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                    Nenhuma página institucional criada ainda.
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <Link
                        href={`/admin/paginas/${p.id}`}
                        className="font-bold text-gray-900 hover:text-ufrpe-blue-800 block text-base"
                      >
                        {p.title}
                      </Link>
                      <span className="text-xs font-mono text-ufrpe-blue-700">
                        /pagina/{p.slug}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                        <Layers className="w-3.5 h-3.5 text-ufrpe-green-700" />
                        {p._count.blocks} blocos
                      </span>
                    </td>

                    <td className="p-4">
                      {p.status === 'PUBLISHED' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Publicada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                          <Clock className="w-3.5 h-3.5" />
                          Rascunho
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap">
                      {formatDate(p.updatedAt)}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status === 'PUBLISHED' && (
                          <Link
                            href={`/pagina/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-ufrpe-blue-800 rounded hover:bg-slate-100"
                            title="Visualizar no portal público"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/paginas/${p.id}`}
                          className="p-1.5 text-gray-600 hover:text-ufrpe-blue-800 rounded hover:bg-slate-100"
                          title="Editar blocos de conteúdo"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeletePageButton id={p.id} title={p.title} />
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
