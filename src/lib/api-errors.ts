/**
 * Utilitário centralizado para extrair e traduzir mensagens de erro de chamadas de API.
 * Garante que os motivos reais (sessão expirada, sem permissão, CSRF, erro de servidor)
 * sejam exibidos claramente em português no painel administrativo.
 */
export async function getApiErrorMessage(res: Response, fallback = 'Erro ao processar solicitação.'): Promise<string> {
  let serverMessage = '';

  try {
    const data = await res.json();
    if (data && typeof data === 'object') {
      serverMessage = data.error || data.message || '';
    }
  } catch {
    // Resposta não é JSON (ex: página HTML de erro do proxy ou Next.js)
  }

  // Tratamento por código de status HTTP
  switch (res.status) {
    case 401:
      return 'Sua sessão expirou ou você não está autenticado. Por favor, faça login novamente para continuar.';
    case 403:
      return (
        serverMessage ||
        'Acesso negado (Erro 403): Seu usuário não possui permissão para esta operação ou o token de segurança (CSRF) expirou.'
      );
    case 404:
      return serverMessage || 'O recurso solicitado não foi encontrado no sistema (Erro 404).';
    case 413:
      return 'O arquivo ou conteúdo enviado é muito grande e ultrapassa o limite permitido pelo servidor (Erro 413).';
    case 500:
      return serverMessage
        ? `Erro no servidor: ${serverMessage}`
        : 'Erro interno no servidor (Código 500). Tente novamente em instantes ou contate o administrador.';
    case 502:
    case 503:
    case 504:
      return `Serviço temporariamente indisponível no servidor (Código ${res.status}). Verifique a conexão com o backend.`;
    default:
      return serverMessage || `${fallback} (Código ${res.status})`;
  }
}
