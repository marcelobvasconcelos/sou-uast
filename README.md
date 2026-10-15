# Portal Institucional do Projeto de Extensão SOU+UAST
**Unidade Acadêmica de Serra Talhada (UAST) — Universidade Federal Rural de Pernambuco (UFRPE)**

---

## 📌 Visão Geral do Projeto

O **SOU+UAST** é o portal institucional oficial do projeto de extensão universitária da **UAST/UFRPE**, concebido para aproximar a universidade pública das escolas de ensino fundamental e médio do Sertão de Pernambuco (Pajeú e regiões vizinhas).

O portal oferece:
- **Divulgação Institucional:** Apresentação da universidade federal gratuita, cursos de graduação, assistência estudantil e formas de ingresso (SiSU/ENEM).
- **Publicação Estilo Drupal:** Criação de notícias em formulário único, salvamento como rascunho, pré-visualização fiel antes da publicação e destaque automático no carrossel.
- **Páginas Modulares por Blocos:** Construtor de páginas institucionais com blocos ordenáveis (texto rico, imagens com legenda, vídeos incorporados, galerias de fotos e blocos HTML livres sanitizados com whitelist de iframes).
- **Menu Lateral em Cascata:** Menu hierárquico (categorias pai e subitens) presente em páginas internas, com versão responsiva em acordeão no mobile.
- **Rodapé no Padrão uast.ufrpe.br:** Endereço oficial em Serra Talhada, telefones, links institucionais, redes sociais oficiais e conformidade com a LGPD.
- **Acessibilidade WCAG 2.1 AA e e-MAG:** Barra superior com atalhos de teclado (Alt+1, Alt+2, Alt+3), alternador de alto contraste, controle de tamanho de tipografia (A+/A-) e textos alternativos (Alt) em imagens.

---

## 🛠️ Stack Tecnológica

- **Frontend & Backend:** Next.js 14 (App Router) com TypeScript
- **Estilização:** Tailwind CSS com `@tailwindcss/typography` e cores institucionais UFRPE (Azul `#003366` e Verde `#006633`)
- **Banco de Dados:** PostgreSQL 16
- **ORM:** Prisma 5 (com migrations e seed automatizado)
- **Autenticação:** NextAuth.js com JWT e senhas criptografadas em bcrypt
- **Armazenamento de Uploads:** Volume persistente Docker com rota de streaming dedicada (`/api/uploads/*`) e arquitetura preparada para S3/MinIO
- **Segurança:** Sanitização de HTML com whitelist de iframes configurável pelo painel administrativo, proteção XSS/CSRF e logs de auditoria

---

## 🚀 1. Execução no Localhost (Desenvolvimento / Validação)

### Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/) instalados na máquina.

### Passo Único: Subir Aplicação
Abra o terminal na pasta raiz do projeto e execute:

```bash
docker compose up -d --build
```

O comando irá:
1. Subir o container do banco de dados **PostgreSQL 16** com volume persistente nomeado (`sou_uast_postgres_data`).
2. Aguardar o banco estar pronto via healthcheck (`pg_isready`).
3. Compilar a imagem multi-stage do **Next.js** em modo standalone enxuto.
4. Aplicar o schema do banco (`prisma db push`) e rodar o seed automático (`prisma/seed.js`), criando os usuários, notícias de exemplo, menu em cascata e configurações institucionais.
5. Iniciar o portal na porta **3000**.

### Acessar no Navegador
- **Portal Público:** [http://localhost:3000](http://localhost:3000)
- **Área Administrativa:** [http://localhost:3000/login](http://localhost:3000/login)

---

## 🔑 Credenciais de Acesso Inicial (Seed)

| Papel | E-mail | Senha Padrão | Permissões |
|---|---|---|---|
| **Administrador** | `admin@ufrpe.br` | `Admin@SouUast2025` | Acesso total: Notícias, Páginas, Menu, Usuários, Configurações e Logs de Auditoria |
| **Editor de Conteúdo** | `editor@ufrpe.br` | `Editor@SouUast2025` | Gestão de conteúdo: Notícias, Páginas e Banners |

> 💡 *As senhas e usuários podem ser alterados ou criados a qualquer momento pelo menu **Usuários & Papéis** no painel administrativo.*

---

## 📰 2. Experiência de Publicação Estilo Drupal

Para criar ou editar notícias:
1. Acesse o painel em `/admin` e clique em **Notícias & Destaques** -> **Cadastrar Notícia**.
2. Preencha o formulário único:
   - **Título da Notícia:** O slug amigável da URL é gerado automaticamente.
   - **Resumo / Lead:** Texto introdutório exibido no carrossel e nos cards.
   - **Corpo da Matéria:** Editor rico com barra de ferramentas para negrito, itálico, subtítulos H2/H3, listas, citações e tabelas.
   - **Capa da Notícia:** Upload com barra de progresso em tempo real, validação de formato (JPG/PNG/WebP) e indicador de proporção 16:9.
   - **Destacar no Carrossel:** Marque a opção para que a notícia apareça no carrossel da página inicial. O sistema exibe no máximo as 3 notícias destacadas mais recentes.
3. Botões de Ação:
   - **Pré-visualizar:** Abre uma janela modal mostrando exatamente como a notícia será exibida aos visitantes antes de publicá-la.
   - **Salvar como Rascunho:** Mantém a notícia salva para revisão interna sem publicá-la no portal público.
   - **Publicar Notícia:** Publica imediatamente no site.

---

## 🧱 3. Criação de Páginas com Modelo de Blocos

Para cadastrar páginas dinâmicas:
1. Acesse `/admin/paginas` -> **Criar Nova Página**.
2. Defina o **Título**, **Slug da URL** (ex: `/pagina/cursos-de-graduacao`) e **Banner Superior Opcional**.
3. Adicione blocos de conteúdo na ordem desejada:
   - **Texto Rico:** Parágrafos, cabeçalhos, destaques em caixa azul, amarela ou verde.
   - **Imagem:** Upload de foto com legenda e link opcional.
   - **Vídeo:** Incorporação de vídeo do YouTube, Vimeo ou arquivo MP4 local.
   - **Galeria de Fotos:** Grade de fotos com visualizador lightbox ampliado.
   - **HTML Livre:** Código colado (ex: formulários do Google Forms, mapas do Google Maps), sanitizado no servidor com lista branca de iframes.
4. Utilize os botões **Subir**, **Descer**, **Duplicar** e **Excluir** para reorganizar os blocos.
5. Vincule a página criada ao menu institucional em `/admin/menu`.

---

## 👥 4. Gestão da Equipe do Projeto (Seção "Nossa Equipe")

Para gerenciar os docentes, servidores técnico-administrativos e estudantes do projeto:
1. Acesse o painel em `/admin` e clique em **Equipe do Projeto** (`/admin/equipe`).
2. Clique em **Novo Membro** ou **Editar**:
   - **Foto do Integrante:** Upload de imagem (JPG, PNG, WebP) com pré-visualização circular imediata. O usuário é orientado a centralizar o rosto no corte quadrado (1:1), renderizado perfeitamente como círculo no portal.
   - **Fallback Inteligente:** Se o integrante não possuir foto cadastrada, o portal gera automaticamente um círculo de avatar com as iniciais do nome sobre o gradiente institucional.
   - **Nome Completo:** Nome do integrante com destaque visual.
   - **Titulação Acadêmica:** Ex: Doutor em Ciência da Computação, Mestra em Gestão Pública, Graduando em BSI.
   - **Cargo Institucional:** Ex: Professor Adjunto, Técnica em Assuntos Educacionais, Bolsista de Extensão (BEXT).
   - **Participação no SOU+UAST:** Seleção rápida entre *Coordenador*, *Membro*, *Monitor* ou campo livre para função personalizada.
   - **Ordenação:** Botões "Subir" e "Descer" na listagem para reordenação instantânea, além de campo numérico no formulário. *Coordenadores são exibidos primeiro por padrão.*
   - **Ativo/Inativo:** Alternador para ocultar ou exibir o membro sem excluí-lo da base.
3. **Configuração de Posicionamento:**
   - Em `/admin/configuracoes` -> aba **Seção "Sobre" na Home**, configure a posição da grade da equipe:
     - `Abaixo do "Sobre o Projeto"` (Padrão recomendado: contextualiza a instituição antes das pessoas).
     - `Acima do "Sobre o Projeto"` (Entre as notícias e a missão).
     - `No Topo da Página` (Logo abaixo do carrossel de notícias).
     - `Ocultar Seção da Equipe` (Não exibir na home).

---

## 🌐 5. Implantação em Produção no Servidor 172.16.68.50 (Porta 97)

O ambiente de produção está configurado para publicar o site em **`http://172.16.68.50:97`** utilizando o arquivo `docker-compose.prod.yml`.

### Caminho A: Implantação via Git Pull no Servidor (Recomendado)

1. No servidor `172.16.68.50`, clone ou atualize o repositório:
   ```bash
   cd /opt/sou-uast
   git pull origin main
   ```
2. Inicie os containers de produção com a porta 97 mapeada:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
3. Verifique o status dos serviços:
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```
4. O site estará respondendo imediatamente em: **`http://172.16.68.50:97`**

---

### Caminho B: Implantação via Imagem Docker Exportada (`docker save` + `scp`)

Utilize este caminho caso o servidor de produção não possua acesso direto à internet ou ao repositório Git:

1. **Na máquina local (onde o código foi validado):**
   Gere o build e salve a imagem em um arquivo `.tar`:
   ```bash
   # Build da imagem de produção
   docker build -t sou-uast-app:prod -f Dockerfile .

   # Exportar para arquivo compactado
   docker save sou-uast-app:prod | gzip > sou-uast-app-prod.tar.gz
   ```

2. **Transferir os arquivos para o servidor via SCP:**
   ```bash
   scp sou-uast-app-prod.tar.gz docker-compose.prod.yml .env.example usuario@172.16.68.50:/home/usuario/
   ```

3. **No servidor `172.16.68.50`:**
   ```bash
   # Carregar a imagem Docker
   docker load < sou-uast-app-prod.tar.gz

   # Criar o diretório da aplicação e subir os serviços
   docker compose -f docker-compose.prod.yml up -d
   ```

4. Acesse: **`http://172.16.68.50:97`**

---

## ⚙️ 6. Comandos Úteis de Operação

- **Visualizar logs em tempo real:**
  ```bash
  docker compose logs -f app
  ```
- **Acessar o terminal do container da aplicação:**
  ```bash
  docker compose exec app sh
  ```
- **Fazer backup do banco de dados:**
  ```bash
  docker compose exec db pg_dump -U postgres sou_uast_db > backup_sou_uast.sql
  ```
- **Restaurar backup do banco:**
  ```bash
  cat backup_sou_uast.sql | docker compose exec -T db psql -U postgres sou_uast_db
  ```
- **Reiniciar os serviços:**
  ```bash
  docker compose restart
  ```
- **Parar os serviços:**
  ```bash
  docker compose down
  ```

---

## ✅ Verificação dos Critérios de Aceite

| # | Critério de Aceite | Status | Como Validar |
|---|---|---|---|
| **1** | Carrossel exibe até 3 notícias destacadas e o clique abre a notícia correta | **Aprovado** | Acesse `/`, clique em qualquer slide do carrossel no topo; a matéria completa correspondente será aberta. |
| **2** | Editor publica notícia com upload de imagem pelo formulário, sem tocar em código | **Aprovado** | Logue como `editor@ufrpe.br`, vá em `/admin/noticias/nova`, faça upload da imagem e clique em "Publicar". |
| **3** | Criação de categoria e item no menu em cascata com página dinâmica associada | **Aprovado** | Em `/admin/menu`, crie uma categoria e subitem vinculados a uma página criada em `/admin/paginas`. O menu lateral nas páginas internas refletirá a nova estrutura imediatamente. |
| **4** | Página aceita texto rico, imagem, vídeo incorporado e iframe em bloco HTML | **Aprovado** | Acesse `/pagina/sobre-o-projeto` ou crie uma nova página adicionando os blocos de cada tipo. |
| **5** | Rodapé institucional editável pelo painel no padrão da UAST | **Aprovado** | Em `/admin/configuracoes`, altere os telefones ou redes sociais; o rodapé em todas as páginas públicas é atualizado sem mexer em código. |
| **6** | Funcionamento responsivo em Desktop e Mobile | **Aprovado** | Testado com layout mobile first, menu hambúrguer, carrossel com swipe por toque e menu em cascata retrátil. |
| **7** | `docker compose up -d` sobe o site funcional em http://localhost:3000 do zero, com banco migrado e admin criado | **Aprovado** | O `docker-entrypoint.sh` executa `prisma db push` e `prisma/seed.js` automaticamente. |
| **8** | Mesma imagem sobe no servidor 172.16.68.50 na porta 97 (http://172.16.68.50:97) | **Aprovado** | Configurado em `docker-compose.prod.yml` com mapeamento `"97:3000"`. |
| **9** | Seção "Nossa Equipe" exibe foto circular uniforme, nome, titulação, cargo e participação | **Aprovado** | Acesse `/`; a seção da equipe exibe cards com fotos circulares idênticas, alinhadas e com inicial fallback se não houver foto. |
| **10** | Coordenador aparece primeiro por padrão, seguido da ordem definida no painel | **Aprovado** | Na home pública e no painel `/admin/equipe`, coordenadores possuem badge destacada e prioridade na ordenação. |
| **11** | CRUD completo de membros no painel administrativo com upload e pré-visualização circular | **Aprovado** | Acesse `/admin/equipe`; cadastre, edite, ordene e ative/desative membros com pré-visualização em tempo real do formato circular. |
| **12** | Posicionamento da seção de equipe configurável pelo painel | **Aprovado** | Em `/admin/configuracoes` -> aba "Seção 'Sobre' na Home", altere a posição entre após o sobre, antes do sobre, após o carrossel ou ocultar. |
| **13** | Funcionalidades existentes (carrossel, notícias, páginas, rodapé) continuam 100% intactas | **Aprovado** | Todas as rotas públicas e administrativas continuam respondendo HTTP 200 OK sem alterações em dados pré-existentes. |

