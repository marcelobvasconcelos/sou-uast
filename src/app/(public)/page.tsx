import React from 'react';
import Carousel from '@/components/home/Carousel';
import RecentNews from '@/components/home/RecentNews';
import AboutSection from '@/components/home/AboutSection';
import TeamSection from '@/components/home/TeamSection';
import { prisma } from '@/lib/prisma';
import { NewsCardData, TeamMemberData } from '@/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let featuredNews: NewsCardData[] = [];
  let recentNews: NewsCardData[] = [];
  let teamMembers: TeamMemberData[] = [];
  let settings = null;

  try {
    // 1. Notícias para o Carrossel: no máximo 3, publicadas, com destaque e capa
    const rawFeatured = await prisma.news.findMany({
      where: {
        status: 'PUBLISHED',
        isFeatured: true,
        featuredImage: {
          not: null,
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        featuredImage: true,
        isFeatured: true,
        status: true,
        publishedAt: true,
      },
    });

    featuredNews = rawFeatured.filter((item) => Boolean(item.featuredImage)) as any;

    // 2. Notícias Recentes para o bloco abaixo do carrossel
    const rawRecent = await prisma.news.findMany({
      where: {
        status: 'PUBLISHED',
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        featuredImage: true,
        isFeatured: true,
        status: true,
        publishedAt: true,
      },
    });

    recentNews = rawRecent as any;

    // 3. Equipe do Projeto Ativa
    const rawTeam = await prisma.teamMember.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    teamMembers = rawTeam as any;

    // 4. Configurações institucionais da página
    settings = await prisma.siteSetting.findUnique({
      where: { id: 'site_settings' },
    });
  } catch (err) {
    console.error('Erro ao buscar dados da página inicial:', err);
  }

  const teamPosition = settings?.teamSectionPosition || 'AFTER_ABOUT';

  const renderTeamSection = () => {
    if (teamPosition === 'NONE' || teamMembers.length === 0) {
      return null;
    }
    return (
      <TeamSection
        members={teamMembers}
        title={settings?.teamSectionTitle || 'Nossa Equipe'}
        subtitle={settings?.teamSectionSubtitle || 'Conheça os docentes, servidores e estudantes que constroem o SOU+UAST'}
      />
    );
  };

  return (
    <div className="space-y-12">
      {/* 1. Carrossel de Destaques no Topo (até 3 notícias) */}
      {featuredNews.length > 0 && (
        <section className="pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8">
          <Carousel slides={featuredNews} />
        </section>
      )}

      {/* Opção de Posição da Equipe: Logo após o Carrossel */}
      {teamPosition === 'AFTER_CAROUSEL' && renderTeamSection()}

      {/* 2. Bloco de Notícias Recentes */}
      <RecentNews news={recentNews} />

      {/* Opção de Posição da Equipe: Antes de Sobre o Projeto */}
      {teamPosition === 'BEFORE_ABOUT' && renderTeamSection()}

      {/* 3. Bloco "Sobre o Projeto" */}
      <AboutSection
        title={settings?.aboutTitle}
        text={settings?.aboutText}
        buttonText={settings?.aboutButtonText}
        buttonUrl={settings?.aboutButtonUrl}
        imageUrl={settings?.aboutImageUrl}
      />

      {/* Opção de Posição da Equipe: Padrão Recomendado (Após "Sobre o Projeto") */}
      {teamPosition === 'AFTER_ABOUT' && renderTeamSection()}
    </div>
  );
}

