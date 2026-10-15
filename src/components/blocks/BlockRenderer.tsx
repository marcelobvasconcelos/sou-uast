import React from 'react';
import { PageBlockData } from '@/types';
import RichTextBlock from './RichTextBlock';
import ImageBlock from './ImageBlock';
import VideoBlock from './VideoBlock';
import GalleryBlock from './GalleryBlock';
import HtmlBlock from './HtmlBlock';

interface BlockRendererProps {
  blocks: PageBlockData[];
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-sm">Esta página ainda não possui blocos de conteúdo publicados.</p>
      </div>
    );
  }

  // Ordenar blocos pelo campo `order`
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {sortedBlocks.map((block, index) => {
        const key = block.id || `block-${index}`;

        switch (block.type) {
          case 'RICH_TEXT':
            return <RichTextBlock key={key} content={block.content} settings={block.settings} />;
          case 'IMAGE':
            return <ImageBlock key={key} content={block.content} settings={block.settings} />;
          case 'VIDEO':
            return <VideoBlock key={key} content={block.content} settings={block.settings} />;
          case 'GALLERY':
            return <GalleryBlock key={key} content={block.content} settings={block.settings} />;
          case 'HTML':
            return <HtmlBlock key={key} content={block.content} settings={block.settings} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
