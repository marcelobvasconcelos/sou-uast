import React from 'react';
import Link from 'next/link';
import { HelpSection, RoleAccess } from '@/content/help';
import { HelpCircle, Shield, User, Info, AlertTriangle, KeyRound } from 'lucide-react';

interface HelpViewProps {
  sections: HelpSection[];
  role?: RoleAccess | string | null;
  isPublic?: boolean;
}

export default function HelpView({ sections, role, isPublic = false }: HelpViewProps) {
  const normalizedRole: RoleAccess =
    role === 'ADMIN' ? 'ADMIN' : role === 'EDITOR' ? 'EDITOR' : 'VISITOR';

  return (
    <div className="space-y-8">
      {/* Cabeçalho de Contexto e Perfil */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-5 h-5 text-ufrpe-blue-800 flex-shrink-0" aria-hidden="true" />
            <h1 className="text-xl sm:text-2xl font-black text-ufrpe-blue-900 tracking-tight">
              {isPublic ? 'Ajuda e Informações do Portal' : 'Central de Ajuda do Sistema'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {isPublic
              ? 'Orientações gerais sobre o funcionamento do portal e perfis de acesso.'
              : 'Instruções de operação e procedimentos recomendados de acordo com o seu perfil de acesso.'}
          </p>
        </div>

        {/* Badge do Papel do Usuário */}
        <div className="flex-shrink-0">
          {normalizedRole === 'ADMIN' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Shield className="w-3.5 h-3.5 text-amber-800" aria-hidden="true" />
              <span>Perfil: Administrador</span>
            </span>
          )}
          {normalizedRole === 'EDITOR' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
              <User className="w-3.5 h-3.5 text-blue-800" aria-hidden="true" />
              <span>Perfil: Editor de Conteúdo</span>
            </span>
          )}
          {normalizedRole === 'VISITOR' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
              <Info className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              <span>Acesso: Visitante</span>
            </span>
          )}
        </div>
      </div>

      {/* Lista de Seções de Ajuda Filtradas por Perfil */}
      <div className="space-y-6" role="feed" aria-label="Seções de ajuda do sistema">
        {sections.map((section) => (
          <article
            key={section.id}
            aria-labelledby={`heading-${section.id}`}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 hover:border-ufrpe-blue-300 transition-colors"
          >
            {/* Título da Seção */}
            <h2
              id={`heading-${section.id}`}
              className="text-base sm:text-lg font-bold text-ufrpe-blue-900 border-b border-gray-100 pb-2"
            >
              {section.title}
            </h2>

            {/* Texto Corrido (se houver) */}
            {section.content && (
              <p className="text-sm text-gray-700 leading-relaxed">
                {section.content}
              </p>
            )}

            {/* Lista de Passos / Instruções Ordenadas (se houver) */}
            {section.steps && section.steps.length > 0 && (
              <ol className="space-y-2 text-sm text-gray-700 list-none pl-0">
                {section.steps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-2 rounded bg-slate-50 border border-slate-100"
                  >
                    <span className="text-gray-800 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            )}

            {/* Subitens em Formato Rótulo / Descrição (Mensagens de Erro e Perguntas Frequentes) */}
            {section.subItems && section.subItems.length > 0 && (
              <dl className="space-y-3 text-sm">
                {section.subItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
                  >
                    <dt className="font-bold text-gray-900 text-sm">
                      {item.label}:
                    </dt>
                    <dd className="text-gray-700 text-sm leading-relaxed pl-0 ml-0">
                      {item.text}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </article>
        ))}
      </div>

      {/* Chamada para Acesso no Ambiente Público */}
      {isPublic && (
        <div className="bg-ufrpe-blue-50 border border-ufrpe-blue-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-ufrpe-blue-950">
              Membro da equipe ou colaborador cadastrado?
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Acesse a área administrativa para visualizar as instruções detalhadas de publicação e gestão de conteúdo.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-ufrpe-blue-800 hover:bg-ufrpe-blue-900 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Acessar Painel</span>
          </Link>
        </div>
      )}
    </div>
  );
}
