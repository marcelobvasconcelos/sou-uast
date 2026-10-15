import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDateTime } from '@/lib/utils';
import { History, Shield, User, FileText, Settings, KeyRound } from 'lucide-react';

export const metadata = {
  title: 'Log de Auditoria | Painel SOU+UAST',
};

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'ADMIN') {
    redirect('/admin');
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-100 text-green-800">CRIADO</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800">ATUALIZADO</span>;
      case 'PUBLISH':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-800">PUBLICADO</span>;
      case 'UNPUBLISH':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800">DESPUBLICADO</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-800">EXCLUÍDO</span>;
      case 'LOGIN':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-800">LOGIN</span>;
      case 'SETTINGS_CHANGE':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-100 text-cyan-800">CONFIGURAÇÃO</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-800">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-ufrpe-blue-900 flex items-center gap-2">
          <History className="w-6 h-6 text-ufrpe-green-700" />
          <span>Histórico e Log de Auditoria</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Registro de auditoria com rastreabilidade completa: quem criou, editou ou publicou cada conteúdo e quando.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-gray-700 border-b">
              <tr>
                <th className="p-4">Data / Hora</th>
                <th className="p-4">Usuário</th>
                <th className="p-4">Ação</th>
                <th className="p-4">Entidade</th>
                <th className="p-4">Detalhes do Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-xs">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 italic font-sans">
                    Nenhum registro de auditoria gravado ainda.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 whitespace-nowrap text-gray-500">
                      {formatDateTime(log.createdAt)}
                    </td>

                    <td className="p-4 font-sans font-semibold text-gray-800 whitespace-nowrap">
                      {log.userName || log.user?.name || log.userEmail || 'Sistema'}
                    </td>

                    <td className="p-4 font-sans">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="p-4 font-sans font-medium text-gray-700 whitespace-nowrap">
                      {log.entityType}
                    </td>

                    <td className="p-4 font-sans text-gray-600 max-w-md">
                      {log.details || '-'}
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
