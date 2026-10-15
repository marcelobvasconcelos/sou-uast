/**
 * Utilitário centralizado para resolução de URLs de API no cliente e servidor.
 * Garante compatibilidade tanto para execuções na raiz (subdomínio ou localhost)
 * quanto sob subpastas com Next.js basePath (ex: /soumaisuast).
 */

let rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
if (rawBasePath.startsWith('http://') || rawBasePath.startsWith('https://')) {
  try {
    rawBasePath = new URL(rawBasePath).pathname;
  } catch {}
}
rawBasePath = rawBasePath.replace(/\/+$/, '');
export const BASE_PATH = rawBasePath === '/' || !rawBasePath ? '' : (rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`);

/**
 * Adiciona o prefixo do basePath se necessário a qualquer caminho absoluto interno.
 * Exemplo:
 * - getApiUrl('/api/admin/news') -> '/soumaisuast/api/admin/news' (se BASE_PATH="/soumaisuast")
 * - getApiUrl('/api/admin/news') -> '/api/admin/news' (se BASE_PATH="")
 */
export function getApiUrl(path: string): string {
  if (!path || !path.startsWith('/')) {
    return path;
  }
  if (BASE_PATH && !path.startsWith(BASE_PATH)) {
    return `${BASE_PATH}${path}`;
  }
  return path;
}
