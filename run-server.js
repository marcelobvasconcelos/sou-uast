const http = require('http');
const { spawn } = require('child_process');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const INTERNAL_PORT = 3001;

// Obter BASE_PATH (limpo de protocolo se houver)
let rawBasePath = process.env.BASE_PATH || '';
if (rawBasePath.startsWith('http://') || rawBasePath.startsWith('https://')) {
  try {
    rawBasePath = new URL(rawBasePath).pathname;
  } catch {}
}
rawBasePath = rawBasePath.replace(/\/+$/, '');
const BASE_PATH = rawBasePath === '/' || !rawBasePath ? '' : (rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`);

console.log(`[Gateway SOU+UAST] Iniciando processo Next.js interno na porta ${INTERNAL_PORT}...`);
console.log(`[Gateway SOU+UAST] BASE_PATH configurado: "${BASE_PATH || '(raiz)'}"`);

// Iniciar Next.js standalone na porta interna 3001
const nextEnv = {
  ...process.env,
  PORT: String(INTERNAL_PORT),
  HOSTNAME: '127.0.0.1',
};

const nextProcess = spawn('node', ['server.js'], {
  env: nextEnv,
  stdio: 'inherit',
});

nextProcess.on('exit', (code) => {
  console.log(`[Gateway SOU+UAST] Next.js encerrou com código ${code}`);
  process.exit(code || 0);
});

// Proxy HTTP na porta principal
const server = http.createServer((req, res) => {
  let targetPath = req.url;

  // Se a requisição veio sem o BASE_PATH (ex: proxy reverso do Apache cortou o prefixo),
  // adicionamos o prefixo automaticamente para que o Next.js responda corretamente!
  if (BASE_PATH && !targetPath.startsWith(BASE_PATH)) {
    targetPath = `${BASE_PATH}${targetPath.startsWith('/') ? targetPath : '/' + targetPath}`;
  }

  const options = {
    hostname: '127.0.0.1',
    port: INTERNAL_PORT,
    path: targetPath,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', () => {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Inicializando servidor... por favor recarregue em instantes.');
  });

  req.pipe(proxyReq, { end: true });
});

// Suporte a WebSocket / Upgrade
server.on('upgrade', (req, socket, head) => {
  let targetPath = req.url;
  if (BASE_PATH && !targetPath.startsWith(BASE_PATH)) {
    targetPath = `${BASE_PATH}${targetPath.startsWith('/') ? targetPath : '/' + targetPath}`;
  }

  const options = {
    hostname: '127.0.0.1',
    port: INTERNAL_PORT,
    path: targetPath,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options);
  proxyReq.on('upgrade', (proxyRes, proxySocket) => {
    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\n` +
      Object.keys(proxyRes.headers).map(k => `${k}: ${proxyRes.headers[k]}`).join('\r\n') +
      '\r\n\r\n'
    );
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });
  proxyReq.on('error', () => {
    socket.destroy();
  });
  proxyReq.end();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Gateway SOU+UAST] Gateway rodando na porta ${PORT} -> repassando para Next.js na porta ${INTERNAL_PORT}`);
});
