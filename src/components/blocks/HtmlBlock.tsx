import React from 'react';

interface HtmlBlockProps {
  content: string; // HTML já sanitizado pelo servidor com whitelist de iframes
  settings?: string | null;
}

export default function HtmlBlock({ content }: HtmlBlockProps) {
  if (!content) return null;

  return (
    <div className="my-8 w-full overflow-x-auto">
      <div
        className="w-full rounded-lg"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
