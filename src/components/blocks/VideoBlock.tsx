import React from 'react';
import { VideoBlockContent } from '@/types';

interface VideoBlockProps {
  content: string; // JSON string ou URL
  settings?: string | null;
}

export default function VideoBlock({ content }: VideoBlockProps) {
  let data: VideoBlockContent = {
    url: '',
    title: 'Vídeo institucional',
    caption: '',
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

  if (!data.url) return null;

  // Tratar URL do YouTube para embed
  const getEmbedUrl = (rawUrl: string): { type: 'youtube' | 'vimeo' | 'html5'; embedUrl: string } => {
    try {
      const urlObj = new URL(rawUrl);

      // YouTube
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        let videoId = '';
        if (urlObj.hostname.includes('youtu.be')) {
          videoId = urlObj.pathname.slice(1);
        } else {
          videoId = urlObj.searchParams.get('v') || '';
        }
        return {
          type: 'youtube',
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        };
      }

      // Vimeo
      if (urlObj.hostname.includes('vimeo.com')) {
        const idMatch = urlObj.pathname.match(/\/(\d+)/);
        const vimeoId = idMatch ? idMatch[1] : '';
        return {
          type: 'vimeo',
          embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
        };
      }
    } catch {
      // URL relativa ou arquivo local
    }

    // Vídeo local ou arquivo MP4/WebM
    return {
      type: 'html5',
      embedUrl: rawUrl,
    };
  };

  const videoInfo = getEmbedUrl(data.url);

  return (
    <figure className="my-8 w-full max-w-4xl mx-auto">
      <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-black">
        {videoInfo.type === 'youtube' || videoInfo.type === 'vimeo' ? (
          <iframe
            src={videoInfo.embedUrl}
            title={data.title || 'Vídeo incorporado'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <video
            src={videoInfo.embedUrl}
            controls
            preload="metadata"
            className="w-full h-full object-contain"
            title={data.title || 'Reprodutor de vídeo'}
          >
            Seu navegador não suporta a reprodução deste formato de vídeo.
          </video>
        )}
      </div>

      {(data.title || data.caption) && (
        <figcaption className="text-center text-xs md:text-sm text-gray-500 mt-2.5">
          {data.title && <strong className="text-gray-700 block">{data.title}</strong>}
          {data.caption && <span className="italic">{data.caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}
