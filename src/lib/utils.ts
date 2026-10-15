export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normaliza acentuações
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // Remove caracteres inválidos
    .replace(/\s+/g, '-') // Substitui espaços por -
    .replace(/-+/g, '-'); // Remove hífens duplicados
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function estimateReadingTime(textOrHtml: string): string {
  if (!textOrHtml) return '1 min de leitura';
  // Remove tags HTML
  const cleanText = textOrHtml.replace(/<[^>]*>?/gm, '');
  const wordCount = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 200;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes} min de leitura`;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
