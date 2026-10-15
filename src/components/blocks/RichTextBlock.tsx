import React from 'react';
import { RichTextSettings } from '@/types';

interface RichTextBlockProps {
  content: string; // HTML formatado do editor rico
  settings?: string | null; // JSON string com RichTextSettings
}

export default function RichTextBlock({ content, settings }: RichTextBlockProps) {
  let parsedSettings: RichTextSettings = {
    alignment: 'left',
    style: 'default',
    fontSize: 'normal',
  };

  if (settings) {
    try {
      parsedSettings = { ...parsedSettings, ...JSON.parse(settings) };
    } catch {
      // Usar padrão se o parse falhar
    }
  }

  // Alinhamento
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }[parsedSettings.alignment || 'left'];

  // Tamanho de Fonte
  const fontSizeClass = {
    small: 'prose-sm',
    normal: 'prose-base md:prose-lg',
    large: 'prose-lg md:prose-xl',
  }[parsedSettings.fontSize || 'normal'];

  // Variações de Estilo (Destaque, Chamada, Citação ou Padrão)
  let wrapperClass = 'my-6';
  if (parsedSettings.style === 'highlight') {
    wrapperClass = 'my-8 p-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg shadow-sm';
  } else if (parsedSettings.style === 'callout') {
    wrapperClass = 'my-8 p-6 bg-ufrpe-blue-50 border-l-4 border-ufrpe-blue-800 rounded-r-lg shadow-sm';
  } else if (parsedSettings.style === 'quote') {
    wrapperClass = 'my-8 p-6 bg-slate-50 border-l-4 border-ufrpe-green-700 italic rounded-r-lg';
  }

  return (
    <div className={wrapperClass}>
      <div
        className={`prose max-w-none prose-headings:text-ufrpe-blue-900 prose-a:text-ufrpe-blue-800 hover:prose-a:text-ufrpe-green-700 prose-img:rounded-lg ${alignmentClass} ${fontSizeClass}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
