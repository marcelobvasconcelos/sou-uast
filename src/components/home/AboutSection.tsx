import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Users, Compass, Award } from 'lucide-react';

interface AboutSectionProps {
  title?: string;
  text?: string;
  buttonText?: string;
  buttonUrl?: string;
  imageUrl?: string | null;
}

export default function AboutSection({
  title = 'Sobre o Projeto SOU+UAST',
  text,
  buttonText = 'Conheça o Projeto Completo',
  buttonUrl = '/pagina/sobre-o-projeto',
  imageUrl = '/images/banners/sobre-uast.svg',
}: AboutSectionProps) {
  const defaultText =
    'O SOU+UAST é um projeto de extensão universitária da Unidade Acadêmica de Serra Talhada (UAST/UFRPE) voltado à aproximação entre a universidade pública e as escolas de ensino fundamental e médio do Sertão do Pajeú. Nosso objetivo é apresentar as oportunidades dos cursos de graduação, pós-graduação, pesquisa e extensão, democratizando o acesso ao ensino superior público, gratuito e de qualidade.';

  const contentText = text || defaultText;

  const highlights = [
    {
      icon: BookOpen,
      title: 'Apoio Vocacional',
      desc: 'Orientação sobre cursos e carreiras',
    },
    {
      icon: Users,
      title: 'Comunidade & Escola',
      desc: 'Visitas guiadas aos laboratórios',
    },
    {
      icon: Compass,
      title: 'Acesso SiSU/ENEM',
      desc: 'Dicas práticas sobre vagas gratuitas',
    },
    {
      icon: Award,
      title: 'UFRPE no Sertão',
      desc: 'Ensino federal gratuito de excelência',
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-t border-b border-gray-200" aria-labelledby="about-section-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Lado Esquerdo: Imagem / Banner Ilustrativo */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-ufrpe-blue-900">
              <Image
                src={imageUrl || '/images/banners/sobre-uast.svg'}
                alt="Apresentação institucional do projeto SOU+UAST"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
            {/* Badge decorativo */}
            <div className="absolute -bottom-4 -right-4 bg-ufrpe-green-700 text-white py-2 px-4 rounded-xl shadow-md hidden sm:block">
              <span className="text-xs font-bold uppercase tracking-wider block">Extensão Universitária</span>
              <span className="text-sm font-semibold">UAST / UFRPE</span>
            </div>
          </div>

          {/* Lado Direito: Texto Institucional e Destaques */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-ufrpe-blue-100 text-ufrpe-blue-800">
              Conheça Nossa Missão
            </div>

            <h2 id="about-section-heading" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ufrpe-blue-900 leading-tight">
              {title}
            </h2>

            <p className="text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {contentText}
            </p>

            {/* Grid de 4 microdestaques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-2 bg-ufrpe-blue-50 text-ufrpe-blue-800 rounded-lg">
                      <Icon className="w-5 h-5 text-ufrpe-blue-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botão de Ação */}
            <div className="pt-4">
              <Link
                href={buttonUrl}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg font-bold text-white bg-ufrpe-blue-800 hover:bg-ufrpe-green-700 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-ufrpe-blue-300"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
