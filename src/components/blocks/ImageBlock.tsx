import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { ImageBlockContent } from '@/types';
import { getAssetUrl } from '@/lib/api-client';

interface ImageBlockProps {
  content: string; // JSON string ou URL direta
  settings?: string | null;
}

export default function ImageBlock({ content, settings }: ImageBlockProps) {
  let data: ImageBlockContent = {
    url: '',
    alt: 'Imagem institucional do projeto',
    caption: '',
    linkUrl: '',
  };

  try {
    if (content.startsWith('{')) {
      data = { ...data, ...JSON.parse(content) };
    } else {
      data.url = content;
    }
  } catch {
    data.url = content;
  }

  let parsedSettings = { width: 'full' };
  if (settings) {
    try {
      parsedSettings = { ...parsedSettings, ...JSON.parse(settings) };
    } catch {
      // Padrão
    }
  }

  if (!data.url) return null;

  const widthClass = {
    full: 'w-full',
    center: 'max-w-3xl mx-auto',
    left: 'max-w-md float-left mr-6 mb-4',
    right: 'max-w-md float-right ml-6 mb-4',
  }[parsedSettings.width || 'full'];

  const imageElement = (
    <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden shadow-md bg-gray-100 group">
      <Image
        src={getAssetUrl(data.url)}
        alt={data.alt || 'Imagem da página'}
        fill
        sizes="(max-width: 1024px) 100vw, 900px"
        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
        loading="lazy"
      />
      {data.linkUrl && (
        <div className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-4 h-4" />
        </div>
      )}
    </div>
  );

  return (
    <figure className={`my-8 ${widthClass}`}>
      {data.linkUrl ? (
        <Link
          href={data.linkUrl}
          target={data.linkUrl.startsWith('http') ? '_blank' : undefined}
          rel={data.linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="block focus:outline-none focus:ring-4 focus:ring-ufrpe-blue-400 rounded-xl"
          title={data.caption || data.alt}
        >
          {imageElement}
        </Link>
      ) : (
        imageElement
      )}

      {data.caption && (
        <figcaption className="text-center text-xs md:text-sm text-gray-500 mt-2.5 italic">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
}
