'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Pause, Play, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { NewsCardData } from '@/types';
import { getAssetUrl } from '@/lib/api-client';

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
        {/* Imagem de Capa com Otimização e Brilho Natural */}
        <div className="absolute inset-0">
          <Image
            src={getAssetUrl(currentSlide.featuredImage || '/images/news/noticia-1.svg')}
            alt={`Imagem de capa da notícia: ${currentSlide.title}`}
            fill
            priority={currentIndex === 0}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </div>

        {/* Gradiente Suave apenas na base para legibilidade sem cobrir a imagem */}
        <div
          className="absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Conteúdo Sobreposto Discreto na Base (ênfase na imagem) */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 text-white z-10 max-w-3xl space-y-1.5 pr-28 sm:pr-32">
          {/* Tag de Destaque + Metadados Compactos */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded font-bold bg-ufrpe-green-700/90 text-white shadow-sm uppercase tracking-wider text-[10px]">
              Destaque
            </span>
            <span className="flex items-center gap-1 text-slate-300 text-xs">
              <Calendar className="w-3 h-3 text-ufrpe-green-400" />
              <time dateTime={new Date(currentSlide.publishedAt).toISOString()}>
                {formatDate(currentSlide.publishedAt)}
              </time>
            </span>
          </div>

          {/* Título da Notícia Compacto e Discreto */}
          <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white group-hover:text-yellow-300 transition-colors line-clamp-2 leading-snug drop-shadow-sm">
            {currentSlide.title}
          </h2>
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
