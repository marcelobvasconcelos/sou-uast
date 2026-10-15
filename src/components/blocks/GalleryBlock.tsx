'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn } from 'lucide-react';
import { GalleryBlockContent, GalleryItem } from '@/types';

interface GalleryBlockProps {
  content: string; // JSON string com GalleryBlockContent
  settings?: string | null;
}

export default function GalleryBlock({ content, settings }: GalleryBlockProps) {
  let data: GalleryBlockContent = { images: [], columns: 3 };

  try {
    if (content.startsWith('{')) {
      data = { ...data, ...JSON.parse(content) };
    }
  } catch {
    //
  }

  let parsedSettings = { columns: 3 };
  if (settings) {
    try {
      parsedSettings = { ...parsedSettings, ...JSON.parse(settings) };
    } catch {
      //
    }
  }

  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  if (!data.images || data.images.length === 0) return null;

  const cols = parsedSettings.columns || data.columns || 3;
  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  }[cols as 2 | 3 | 4] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

  return (
    <div className="my-8">
      <div className={`grid ${gridColsClass} gap-4`}>
        {data.images.map((img, idx) => (
          <div
            key={img.id || idx}
            onClick={() => setActiveImage(img)}
            className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-ufrpe-blue-600"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveImage(img);
              }
            }}
            aria-label={`Ampliar imagem: ${img.alt || img.caption || 'Foto da galeria'}`}
          >
            <Image
              src={img.url}
              alt={img.alt || 'Foto da galeria'}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ZoomIn className="w-8 h-8 drop-shadow" />
            </div>
            {img.caption && (
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs truncate">
                {img.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal de Ampliação */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada da imagem"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveImage(null)}
              type="button"
              className="absolute -top-12 right-0 p-2 text-white hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-full"
              aria-label="Fechar visualização"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="relative w-full aspect-[16/10] max-h-[75vh] rounded-lg overflow-hidden bg-black">
              <Image
                src={activeImage.url}
                alt={activeImage.alt || 'Imagem ampliada'}
                fill
                className="object-contain"
                priority
              />
            </div>

            {activeImage.caption && (
              <p className="text-white text-sm mt-3 text-center bg-black/60 px-4 py-2 rounded-full">
                {activeImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
