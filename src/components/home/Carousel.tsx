'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Pause, Play, Clock, Calendar } from 'lucide-react';
import { formatDate, estimateReadingTime } from '@/lib/utils';
import { NewsCardData } from '@/types';

interface CarouselProps {
  slides: NewsCardData[];
}

export default function Carousel({ slides }: CarouselProps) {
  // Garantir que são no máximo 3 notícias destacadas
  const validSlides = slides.slice(0, 3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = validSlides.length;

  const nextSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Autoplay com pausa por interação ou controle manual
  useEffect(() => {
    if (!isPlaying || isInteracting || total <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying, isInteracting, nextSlide, total]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swipe para a esquerda -> próximo
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      // Swipe para a direita -> anterior
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (total === 0) {
    return null;
  }

  const currentSlide = validSlides[currentIndex];

  return (
    <section
      className="relative w-full rounded-2xl overflow-hidden shadow-xl bg-slate-900 border border-slate-800"
      aria-roledescription="carrossel"
      aria-label="Notícias em destaque do SOU+UAST"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocus={() => setIsInteracting(true)}
      onBlur={() => setIsInteracting(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Container Principal do Slide Clicável */}
      <Link
        href={`/noticias/${currentSlide.slug}`}
        className="block relative aspect-[16/9] sm:aspect-[21/9] min-h-[380px] sm:min-h-[440px] w-full focus:outline-none focus:ring-4 focus:ring-yellow-400 group"
        title={`Abrir notícia: ${currentSlide.title}`}
      >
        {/* Imagem de Capa com Otimização */}
        <div className="absolute inset-0">
          <Image
            src={currentSlide.featuredImage || '/images/news/noticia-1.svg'}
            alt={`Imagem de capa da notícia: ${currentSlide.title}`}
            fill
            priority={currentIndex === 0}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-90"
          />
        </div>

        {/* Gradiente Escuro para Garantir Alto Contraste com o Texto (WCAG AA) */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent"
          aria-hidden="true"
        />

        {/* Conteúdo Sobreposto */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 text-white z-10 max-w-4xl space-y-3">
          {/* Tag de Destaque + Metadados */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full font-bold bg-ufrpe-green-600 text-white shadow-sm uppercase tracking-wider text-[11px]">
              Destaque
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-ufrpe-green-400" />
              <time dateTime={new Date(currentSlide.publishedAt).toISOString()}>
                {formatDate(currentSlide.publishedAt)}
              </time>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              <span>{estimateReadingTime(currentSlide.summary)}</span>
            </span>
          </div>

          {/* Título da Notícia */}
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white group-hover:text-yellow-300 transition-colors duration-200 line-clamp-2 sm:line-clamp-3">
            {currentSlide.title}
          </h2>

          {/* Resumo da Notícia */}
          <p className="text-sm sm:text-base text-slate-200 line-clamp-2 max-w-3xl leading-relaxed">
            {currentSlide.summary}
          </p>

          {/* Chamada para Ação */}
          <div className="pt-2">
            <span className="inline-flex items-center text-xs sm:text-sm font-semibold text-yellow-300 group-hover:underline">
              Ler notícia completa →
            </span>
          </div>
        </div>
      </Link>

      {/* Controles de Navegação por Setas */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              prevSlide();
            }}
            type="button"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/50 text-white hover:bg-black/80 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            aria-label="Slide anterior"
            title="Slide anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              nextSlide();
            }}
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/50 text-white hover:bg-black/80 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            aria-label="Próximo slide"
            title="Próximo slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Barra de Indicadores e Botão Pausar/Reproduzir (WCAG 2.2.2) */}
          <div className="absolute bottom-3 right-6 z-20 flex items-center space-x-3 bg-black/60 backdrop-blur-sm py-1.5 px-3 rounded-full border border-white/10">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              type="button"
              className="text-white hover:text-yellow-300 focus:outline-none focus:ring-1 focus:ring-yellow-400 p-1"
              aria-label={isPlaying ? 'Pausar reprodução automática do carrossel' : 'Iniciar reprodução automática do carrossel'}
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center space-x-1.5" role="tablist" aria-label="Indicadores dos slides">
              {validSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  type="button"
                  role="tab"
                  aria-selected={currentIndex === idx}
                  aria-label={`Ir para o slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-yellow-400 ${
                    currentIndex === idx ? 'w-6 bg-yellow-400' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
