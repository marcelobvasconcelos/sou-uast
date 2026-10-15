import React from 'react';
import Image from 'next/image';
import { Award, Users, GraduationCap, ShieldCheck } from 'lucide-react';
import { TeamMemberData } from '@/types';

/**
 * JUSTIFICATIVA DE POSICIONAMENTO DA SEÇÃO DE EQUIPE:
 * 
 * Escolhemos como posição padrão "AFTER_ABOUT" (imediatamente após a seção "Sobre o Projeto").
 * 
 * Justificativa semântica e visual:
 * O fluxo cognitivo do visitante institucional e dos estudantes/escolas segue naturalmente:
 * 1. Destaques e avisos imediatos (Carrossel no Topo)
 * 2. Atualizações recentes e dinâmicas (Notícias Recentes)
 * 3. Missão, objetivos e escopo do projeto (Sobre o Projeto)
 * 4. Pessoas e liderança que tornam essa missão real (Nossa Equipe)
 * 
 * Apresentar a equipe logo após a apresentação da missão consolida a credibilidade institucional,
 * humaniza o projeto e responde diretamente ao usuário "quem são os professores, técnicos e bolsistas
 * responsáveis pelas atividades descritas".
 * 
 * Flexibilidade: Essa posição é configurável pelo administrador no Painel (Configurações do Site),
 * podendo ser alternada entre:
 * - AFTER_ABOUT (Padrão: após Sobre o Projeto)
 * - BEFORE_ABOUT (Antes de Sobre o Projeto, logo após Notícias)
 * - AFTER_CAROUSEL (No topo da página, logo após o Carrossel)
 * - NONE (Oculta da página inicial)
 */

interface TeamSectionProps {
  members: TeamMemberData[];
  title?: string;
  subtitle?: string;
}

/**
 * Extrai até 2 iniciais do nome para o avatar quando não houver foto cadastrada
 */
function getInitials(name: string): string {
  if (!name) return 'UAST';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Retorna classes visuais harmoniosas para a etiqueta de participação no projeto
 */
function getBadgeStyle(projectRole: string) {
  const normalized = (projectRole || '').toLowerCase();
  if (normalized.includes('coordena')) {
    return 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-200';
  }
  if (normalized.includes('monitor') || normalized.includes('bolsista')) {
    return 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200';
  }
  return 'bg-ufrpe-blue-50 text-ufrpe-blue-900 border-ufrpe-blue-200 ring-1 ring-ufrpe-blue-100';
}

export default function TeamSection({
  members,
  title = 'Nossa Equipe',
  subtitle = 'Conheça os docentes, servidores e estudantes que constroem o SOU+UAST',
}: TeamSectionProps) {
  if (!members || members.length === 0) {
    return null;
  }

  // Ordenação garantida: Coordenador primeiro, seguido da ordem definida no painel
  const sortedMembers = [...members].sort((a, b) => {
    const aIsCoord = (a.projectRole || '').toLowerCase().includes('coordena') ? 0 : 1;
    const bIsCoord = (b.projectRole || '').toLowerCase().includes('coordena') ? 0 : 1;
    if (aIsCoord !== bIsCoord) {
      return aIsCoord - bIsCoord;
    }
    return (a.order || 0) - (b.order || 0);
  });

  return (
    <section
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8"
      aria-labelledby="team-section-heading"
    >
      <div>
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-ufrpe-green-50 text-ufrpe-green-700 border border-ufrpe-green-200 mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Quem Faz Acontecer</span>
          </div>

          <h2
            id="team-section-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ufrpe-blue-900 tracking-tight"
          >
            {title}
          </h2>

          {subtitle && (
            <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed">
              {subtitle}
            </p>
          )}

          <div className="w-20 h-1 bg-ufrpe-green-600 mx-auto mt-4 rounded-full" />
        </div>

        {/* Grade Responsiva com Fotos Circulares Perfeitas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedMembers.map((member) => {
            const isCoord = (member.projectRole || '').toLowerCase().includes('coordena');
            const badgeClass = getBadgeStyle(member.projectRole);

            return (
              <article
                key={member.id}
                className={`group relative bg-white rounded-2xl p-6 border transition-all duration-300 flex flex-col items-center text-center ${
                  isCoord
                    ? 'border-ufrpe-blue-300 shadow-md ring-1 ring-ufrpe-blue-100 hover:shadow-lg'
                    : 'border-gray-200 shadow-sm hover:border-ufrpe-blue-300 hover:shadow-md'
                }`}
              >
                {/* 1. Foto Circular Uniforme com Borda e Sombra Suave */}
                <div className="relative mb-5">
                  <div
                    className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 transition-all duration-300 shadow-md bg-slate-100 flex items-center justify-center flex-shrink-0 ${
                      isCoord
                        ? 'border-amber-400 group-hover:border-amber-500 ring-4 ring-amber-100'
                        : 'border-ufrpe-blue-100 group-hover:border-ufrpe-blue-400 ring-2 ring-slate-100'
                    }`}
                  >
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={`Foto de ${member.name}`}
                        fill
                        sizes="(max-width: 640px) 128px, 144px"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      // Fallback com Iniciais quando não houver foto
                      <div
                        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ufrpe-blue-800 to-ufrpe-blue-950 text-white font-extrabold text-2xl tracking-wider select-none shadow-inner"
                        aria-hidden="true"
                      >
                        {getInitials(member.name)}
                      </div>
                    )}
                  </div>

                  {/* Ícone Indicativo Discreto de Coordenador */}
                  {isCoord && (
                    <div
                      className="absolute -bottom-1.5 -right-1.5 bg-amber-500 text-white p-1.5 rounded-full shadow-md border-2 border-white"
                      title="Coordenador do Projeto"
                      aria-label="Coordenador do Projeto"
                    >
                      <Award className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* 2. Etiqueta Visual com a Participação no Projeto */}
                <div className="mb-3">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${badgeClass}`}
                  >
                    {member.projectRole}
                  </span>
                </div>

                {/* 3. Nome Completo em Destaque */}
                <h3 className="font-extrabold text-gray-900 text-base sm:text-lg leading-snug group-hover:text-ufrpe-blue-900 transition-colors">
                  {member.name}
                </h3>

                {/* 4. Titulação Acadêmica */}
                {member.degree && (
                  <p className="text-xs font-semibold text-ufrpe-blue-800 mt-1.5 leading-snug">
                    {member.degree}
                  </p>
                )}

                {/* 5. Cargo Institucional */}
                {member.role && (
                  <p className="text-xs text-gray-500 mt-1 leading-snug">
                    {member.role}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
