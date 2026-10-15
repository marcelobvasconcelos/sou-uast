import sanitizeHtml from 'sanitize-html';

export interface SanitizeOptions {
  allowedIframeDomains?: string[];
}

export function sanitizeContent(dirtyHtml: string, options?: SanitizeOptions): string {
  if (!dirtyHtml) return '';

  const rawWhitelist = options?.allowedIframeDomains || [
    'youtube.com',
    'www.youtube.com',
    'player.vimeo.com',
    'vimeo.com',
    'docs.google.com',
    'forms.gle',
    'google.com',
    'www.google.com',
  ];

  // Normalizar lista de domínios permitidos para iframes
  const normalizedDomains = rawWhitelist
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'strong', 'em', 'strike', 'u',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'br',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'a', 'img', 'figure', 'figcaption', 'div', 'span', 'iframe',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel', 'class'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class', 'style'],
      iframe: [
        'src',
        'width',
        'height',
        'frameborder',
        'allow',
        'allowfullscreen',
        'loading',
        'referrerpolicy',
        'class',
        'title',
      ],
      div: ['class', 'style', 'id'],
      span: ['class', 'style'],
      table: ['class', 'style', 'border'],
      th: ['class', 'style', 'colspan', 'rowspan', 'scope'],
      td: ['class', 'style', 'colspan', 'rowspan'],
      p: ['class', 'style'],
      h1: ['class', 'style'],
      h2: ['class', 'style'],
      h3: ['class', 'style'],
      h4: ['class', 'style'],
      h5: ['class', 'style'],
      h6: ['class', 'style'],
      blockquote: ['class', 'style'],
    },
    allowedIframeHostnames: normalizedDomains,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: (tagName: string, attribs: sanitizeHtml.Attributes) => {
        return {
          tagName,
          attribs: {
            ...attribs,
            rel: 'noopener noreferrer',
          },
        };
      },
    },
  });
}
