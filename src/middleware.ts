import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');

  // Redirecionamento opcional de HTTP para HTTPS quando configurado por variável de ambiente
  // ou quando a URL pública configurada for HTTPS e a requisição pelo proxy chegar em HTTP
  const forceHttps = process.env.FORCE_HTTPS === 'true';
  const publicBaseUrl = process.env.PUBLIC_BASE_URL || '';
  const shouldRedirectHttps = forceHttps || (publicBaseUrl.startsWith('https://') && forwardedProto === 'http');

  const host = forwardedHost || request.headers.get('host') || 'localhost';
  const isInternal = host.includes('127.0.0.1') || host.includes('localhost');

  if (!isInternal && shouldRedirectHttps && forwardedProto === 'http') {
    const httpsUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${host}`);
    return NextResponse.redirect(httpsUrl, 301);
  }

  const response = NextResponse.next();

  // Preservar cabeçalhos de proxy reverso
  if (forwardedHost) {
    response.headers.set('X-Forwarded-Host', forwardedHost);
  }
  if (forwardedProto) {
    response.headers.set('X-Forwarded-Proto', forwardedProto);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Interceptar rotas da aplicação, exceto recursos estáticos e healthcheck
     */
    '/((?!_next/static|_next/image|favicon.ico|images|api/health|soumaisuast/api/health).*)',
  ],
};
