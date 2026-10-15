const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed do SOU+UAST ---');

  // 1. Criar ou Atualizar Usuários
  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || 'Admin@SouUast2025', 10);
  const editorPasswordHash = await bcrypt.hash(process.env.EDITOR_INITIAL_PASSWORD || 'Editor@SouUast2025', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: process.env.ADMIN_INITIAL_EMAIL || 'admin@ufrpe.br' },
    update: {
      name: process.env.ADMIN_INITIAL_NAME || 'Administrador SOU+UAST',
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      name: process.env.ADMIN_INITIAL_NAME || 'Administrador SOU+UAST',
      email: process.env.ADMIN_INITIAL_EMAIL || 'admin@ufrpe.br',
      password: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`✓ Usuário Administrador garantido: ${adminUser.email}`);

  const editorUser = await prisma.user.upsert({
    where: { email: process.env.EDITOR_INITIAL_EMAIL || 'editor@ufrpe.br' },
    update: {
      name: process.env.EDITOR_INITIAL_NAME || 'Editor de Conteúdo UAST',
      role: 'EDITOR',
      isActive: true,
    },
    create: {
      name: process.env.EDITOR_INITIAL_NAME || 'Editor de Conteúdo UAST',
      email: process.env.EDITOR_INITIAL_EMAIL || 'editor@ufrpe.br',
      password: editorPasswordHash,
      role: 'EDITOR',
      isActive: true,
    },
  });
  console.log(`✓ Usuário Editor garantido: ${editorUser.email}`);

  // 2. Configurações Institucionais do Site
  const institutionalLinks = [
    { title: 'Portal UFRPE', url: 'https://www.ufrpe.br' },
    { title: 'Portal UAST', url: 'https://uast.ufrpe.br' },
    { title: 'Ouvidoria UFRPE', url: 'https://falabr.cgu.gov.br' },
    { title: 'Acesso à Informação', url: 'https://www.gov.br/acessoainformacao' },
    { title: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br' },
    { title: 'Declaração de Acessibilidade', url: '/pagina/acessibilidade' },
  ];

  await prisma.siteSetting.upsert({
    where: { id: 'site_settings' },
    update: {},
    create: {
      id: 'site_settings',
      siteName: 'SOU+UAST',
      siteSubtitle: 'Projeto de Extensão Universitária - UAST / UFRPE',
      logoSouUast: '/images/logo-sou-uast.svg',
      logoUfrpe: '/images/logo-ufrpe.svg',
      primaryColor: '#003366',
      secondaryColor: '#006633',
      aboutTitle: 'Conheça o Projeto de Extensão SOU+UAST',
      aboutText: 'O SOU+UAST é uma iniciativa de extensão universitária da Unidade Acadêmica de Serra Talhada (UAST/UFRPE) criada para conectar a universidade pública com as escolas e a comunidade do Sertão de Pernambuco. Por meio de oficinas, visitas guiadas, palestras e materiais interativos, esclarecemos estudantes do ensino básico sobre as oportunidades dos cursos superiores gratuitos de excelência ofertados em Serra Talhada.',
      aboutButtonText: 'Saiba Mais Sobre o Projeto',
      aboutButtonUrl: '/pagina/sobre-o-projeto',
      aboutImageUrl: '/images/banners/sobre-uast.svg',
      footerAddress: 'UAST/UFRPE - Fazenda Saco, s/n, Caixa Postal 063\nCEP: 56909-535 - Serra Talhada - PE',
      footerPhone: '(87) 3831-2900 / 3831-2910',
      footerEmail: 'sou.uast@ufrpe.br',
      footerSocialInstagram: 'https://www.instagram.com/uast_ufrpe/',
      footerSocialFacebook: 'https://www.facebook.com/ufrpeoficial',
      footerSocialYoutube: 'https://www.youtube.com/@ufrpeoficial',
      footerInstitutionalLinks: JSON.stringify(institutionalLinks),
      footerAccessibilityText: 'Este sítio eletrônico foi planejado seguindo as diretrizes do Modelo de Acessibilidade em Governo Eletrônico (e-MAG) e as normas internacionais WCAG 2.1 nível AA.',
      footerCopyright: '© 2025 SOU+UAST - Unidade Acadêmica de Serra Talhada / Universidade Federal Rural de Pernambuco. Conteúdo sob licença aberta para fins educacionais.',
      lgpdNotice: 'Este portal respeita a privacidade de seus visitantes e segue as diretrizes da Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018). Não coletamos dados invasivos ou não autorizados.',
      iframeWhitelist: 'youtube.com, www.youtube.com, player.vimeo.com, docs.google.com, forms.gle, google.com/maps, www.google.com/maps',
      maxUploadSizeMb: 15,
    },
  });
  console.log('✓ Configurações institucionais do site registradas.');

  // 3. Páginas Institucionais Dinâmicas com Blocos
  const pageSobre = await prisma.page.upsert({
    where: { slug: 'sobre-o-projeto' },
    update: {},
    create: {
      title: 'Sobre o Projeto de Extensão SOU+UAST',
      slug: 'sobre-o-projeto',
      subtitle: 'Conectando o ensino superior público às escolas do Sertão',
      status: 'PUBLISHED',
      blocks: {
        create: [
          {
            type: 'RICH_TEXT',
            order: 0,
            content: '<h2>O que é o SOU+UAST?</h2><p>O <strong>SOU+UAST</strong> é um projeto de extensão permanente da <strong>Unidade Acadêmica de Serra Talhada (UAST)</strong>, vinculada à <strong>Universidade Federal Rural de Pernambuco (UFRPE)</strong>. Nosso compromisso fundamental é aproximar a universidade pública de alunos, professores e equipes pedagógicas de escolas públicas e particulares de toda a região do Sertão do Pajeú e municípios vizinhos.</p><p>Sabemos que muitos jovens concluintes do ensino médio ainda desconhecem a ampla oferta de cursos de graduação gratuitos de altíssimo nível científico existentes bem pertinho deles, em Serra Talhada. O SOU+UAST atua como uma ponte de acolhimento e informação.</p>',
            settings: JSON.stringify({ alignment: 'left', style: 'default' }),
          },
          {
            type: 'IMAGE',
            order: 1,
            content: JSON.stringify({
              url: '/images/banners/campus-uast.svg',
              alt: 'Vista do campus da Unidade Acadêmica de Serra Talhada - UAST/UFRPE',
              caption: 'Campus da UAST/UFRPE em Serra Talhada - Polo de excelência em ensino, pesquisa e extensão.',
              linkUrl: '',
            }),
            settings: JSON.stringify({ width: 'full' }),
          },
          {
            type: 'RICH_TEXT',
            order: 2,
            content: '<h3>Principais Objetivos do Projeto</h3><ul><li><strong>Desmistificar a Universidade Pública:</strong> Mostrar que a UAST é gratuita, de qualidade, aberta a todos e acessível pelo ENEM/SiSU.</li><li><strong>Visitas Guiadas aos Laboratórios:</strong> Recepção de caravanas escolares para conhecer instalações de Agronomia, Engenharia de Pesca, Ciências Biológicas, Zootecnia, Química, Letras, Administração e Economia.</li><li><strong>Palestras Itinerantes:</strong> A equipe do projeto vai até as salas de aula do ensino médio ministrar oficinas de orientação profissional e esclarecimento sobre assistência estudantil (moradia, RU e bolsas).</li></ul>',
            settings: JSON.stringify({ alignment: 'left', style: 'default' }),
          },
          {
            type: 'HTML',
            order: 3,
            content: '<div class="bg-blue-50 border-l-4 border-ufrpe-blue-800 p-4 rounded-r my-4"><h4 class="font-bold text-ufrpe-blue-900">Como sua escola pode participar?</h4><p class="text-gray-700 text-sm mt-1">Todas as atividades são 100% gratuitas para escolas públicas e comunitárias. Entre em contato conosco pelo menu "Visitas Guiadas" ou pelo e-mail <strong>sou.uast@ufrpe.br</strong> para agendar uma atividade em sua escola!</p></div>',
            settings: JSON.stringify({}),
          },
        ],
      },
    },
  });

  const pageInstituicao = await prisma.page.upsert({
    where: { slug: 'a-instituicao-uast' },
    update: {},
    create: {
      title: 'A Unidade Acadêmica de Serra Talhada (UAST/UFRPE)',
      slug: 'a-instituicao-uast',
      subtitle: 'Histórico, estrutura e compromisso com o desenvolvimento do semiárido',
      status: 'PUBLISHED',
      blocks: {
        create: [
          {
            type: 'RICH_TEXT',
            order: 0,
            content: '<h2>Histórico da UAST</h2><p>Criada no contexto do processo de interiorização do ensino superior público brasileiro, a <strong>Unidade Acadêmica de Serra Talhada (UAST)</strong> foi instalada em 2006 como campus avançado da Universidade Federal Rural de Pernambuco. Desde sua fundação, a UAST transformou o panorama educacional, científico e econômico do Sertão Pernambucano.</p><p>Com infraestrutura moderna de laboratórios, biblioteca setorial com milhares de títulos, restaurante universitário, área experimental agrícola e corpo docente altamente qualificado (mais de 80% de doutores), a unidade forma profissionais que lideram a transformação do semiárido.</p>',
            settings: JSON.stringify({ alignment: 'left' }),
          },
          {
            type: 'VIDEO',
            order: 1,
            content: JSON.stringify({
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Link demonstrativo
              title: 'Institucional UAST/UFRPE - Conheça nossa estrutura',
              caption: 'Vídeo institucional da Universidade Federal Rural de Pernambuco.',
            }),
            settings: JSON.stringify({}),
          },
        ],
      },
    },
  });

  const pageCursos = await prisma.page.upsert({
    where: { slug: 'cursos-de-graduacao' },
    update: {},
    create: {
      title: 'Cursos de Graduação Presenciais da UAST',
      slug: 'cursos-de-graduacao',
      subtitle: 'Conheça as opções de cursos superiores gratuitos ofertados pelo SiSU',
      status: 'PUBLISHED',
      blocks: {
        create: [
          {
            type: 'RICH_TEXT',
            order: 0,
            content: '<h2>Graduações Gratuitas em Serra Talhada</h2><p>A UAST/UFRPE oferece diversos cursos de graduação reconhecidos pelo MEC com excelentes conceitos:</p><ul><li><strong>Bacharelado em Agronomia:</strong> Formação de engenheiros agrônomos com ênfase na sustentabilidade e convivência com o semiárido.</li><li><strong>Bacharelado em Engenharia de Pesca:</strong> Pioneirismo na aquicultura continental e manejo aquícola do interior.</li><li><strong>Bacharelado em Zootecnia:</strong> Produção animal sustentável, nutrição e melhoramento genético.</li><li><strong>Licenciatura em Ciências Biológicas:</strong> Formação de educadores e pesquisadores da biodiversidade da Caatinga.</li><li><strong>Licenciatura em Química:</strong> Formação de docentes e técnicos com sólidos conhecimentos laboratoriais.</li><li><strong>Licenciatura em Letras (Português/Inglês):</strong> Ensino de línguas e literaturas com abordagem inclusiva.</li><li><strong>Bacharelado em Administração:</strong> Gestão pública, agronegócio e empreendedorismo regional.</li><li><strong>Bacharelado em Ciências Econômicas:</strong> Análise de desenvolvimento regional, políticas públicas e finanças.</li><li><strong>Bacharelado em Sistemas de Informação:</strong> Formação em tecnologia, engenharia de software e inteligência computacional.</li></ul>',
            settings: JSON.stringify({ alignment: 'left' }),
          },
        ],
      },
    },
  });

  const pageVisitas = await prisma.page.upsert({
    where: { slug: 'visitas-guiadas' },
    update: {},
    create: {
      title: 'Visitas Guiadas e Agendamentos para Escolas',
      slug: 'visitas-guiadas',
      subtitle: 'Traga seus estudantes para vivenciar um dia na universidade federal',
      status: 'PUBLISHED',
      blocks: {
        create: [
          {
            type: 'RICH_TEXT',
            order: 0,
            content: '<h2>Como funciona a Visita Guiada?</h2><p>As escolas do ensino fundamental (anos finais) e médio podem agendar visitas com a coordenação do projeto <strong>SOU+UAST</strong>. Durante a visita, os estudantes são acolhidos no auditório e participam de um roteiro interativo por:</p><ol><li>Laboratórios de Microscopia e Anatomia</li><li>Estufa agrícola e setores produtivos</li><li>Laboratórios de Informática e Robótica</li><li>Biblioteca e Restaurante Universitário</li><li>Roda de conversa com estudantes cotistas e bolsistas</li></ol>',
            settings: JSON.stringify({ alignment: 'left' }),
          },
          {
            type: 'HTML',
            order: 1,
            content: '<div class="p-6 bg-green-50 border border-green-200 rounded-lg text-center"><h3 class="text-xl font-bold text-ufrpe-green-800 mb-2">Formulário de Solicitação de Visita</h3><p class="text-gray-700 mb-4">Diretores e professores coordenadores podem preencher a solicitação para nossa equipe entrar em contato.</p><a href="mailto:sou.uast@ufrpe.br?subject=Solicitacao%20de%20Visita%20Escolar%20SOU%2BUAST" class="inline-block px-6 py-3 bg-ufrpe-green-700 text-white font-semibold rounded-md shadow hover:bg-ufrpe-green-800 transition">Solicitar Agendamento por E-mail</a></div>',
            settings: JSON.stringify({}),
          },
        ],
      },
    },
  });

  const pageAcessibilidade = await prisma.page.upsert({
    where: { slug: 'acessibilidade' },
    update: {},
    create: {
      title: 'Declaração de Acessibilidade Digital',
      slug: 'acessibilidade',
      subtitle: 'Compromisso com a inclusão e conformidade com o e-MAG e WCAG 2.1 AA',
      status: 'PUBLISHED',
      blocks: {
        create: [
          {
            type: 'RICH_TEXT',
            order: 0,
            content: '<h2>Diretrizes de Acessibilidade Adotadas</h2><p>O portal do projeto <strong>SOU+UAST</strong> foi construído em estrita conformidade com o <strong>Modelo de Acessibilidade em Governo Eletrônico (e-MAG)</strong>, instituído pelo Governo Federal brasileiro, e com o padrão internacional <strong>Web Content Accessibility Guidelines (WCAG 2.1) em nível AA</strong>.</p><h3>Recursos Disponíveis no Portal:</h3><ul><li><strong>Atalhos de Teclado:</strong><br>• <code>Alt + 1</code>: Salta diretamente para o início do Conteúdo Principal.<br>• <code>Alt + 2</code>: Salta para o Menu de Navegação.<br>• <code>Alt + 3</code>: Salta para o Rodapé Institucional.<br>• <code>Alt + 4</code>: Abre o Painel de Acessibilidade.</li><li><strong>Modo Alto Contraste:</strong> Alternador visual no topo para pessoas com baixa visão ou sensibilidade ao contraste.</li><li><strong>Controle de Tamanho da Tipografia:</strong> Botões <code>A+</code> e <code>A-</code> para ampliação do texto sem distorcer o layout.</li><li><strong>Textos Alternativos (Alt):</strong> Todas as imagens informativas possuem descrição textual para leitores de tela (NVDA, JAWS, TalkBack).</li><li><strong>Navegação semântica:</strong> Estrutura hierárquica de títulos (H1 a H4) e marcações ARIA.</li></ul>',
            settings: JSON.stringify({ alignment: 'left' }),
          },
        ],
      },
    },
  });
  console.log('✓ Páginas dinâmicas criadas.');

  // 4. Categorias de Menu em Cascata e Itens de Menu
  const catInstitucional = await prisma.category.upsert({
    where: { slug: 'institucional' },
    update: { order: 1 },
    create: {
      name: 'Institucional',
      slug: 'institucional',
      order: 1,
      isActive: true,
    },
  });

  const catEscolas = await prisma.category.upsert({
    where: { slug: 'para-escolas' },
    update: { order: 2 },
    create: {
      name: 'Para Escolas e Estudantes',
      slug: 'para-escolas',
      order: 2,
      isActive: true,
    },
  });

  const catComunica = await prisma.category.upsert({
    where: { slug: 'comunicacao' },
    update: { order: 3 },
    create: {
      name: 'Comunicação e Notícias',
      slug: 'comunicacao',
      order: 3,
      isActive: true,
    },
  });

  // Limpar e recriar itens de menu para consistência
  await prisma.menuItem.deleteMany({});

  // Itens da Categoria 1: Institucional
  const itemSobre = await prisma.menuItem.create({
    data: {
      title: 'Sobre o Projeto SOU+UAST',
      categoryId: catInstitucional.id,
      pageId: pageSobre.id,
      order: 1,
      isActive: true,
    },
  });

  const itemUast = await prisma.menuItem.create({
    data: {
      title: 'A Instituição UAST/UFRPE',
      categoryId: catInstitucional.id,
      pageId: pageInstituicao.id,
      order: 2,
      isActive: true,
    },
  });

  // Subitem em cascata (filho de A Instituição UAST/UFRPE)
  await prisma.menuItem.create({
    data: {
      title: 'Cursos de Graduação Presenciais',
      categoryId: catInstitucional.id,
      parentId: itemUast.id,
      pageId: pageCursos.id,
      order: 1,
      isActive: true,
    },
  });

  // Itens da Categoria 2: Para Escolas
  await prisma.menuItem.create({
    data: {
      title: 'Visitas Guiadas e Agendamento',
      categoryId: catEscolas.id,
      pageId: pageVisitas.id,
      order: 1,
      isActive: true,
    },
  });

  await prisma.menuItem.create({
    data: {
      title: 'Como Ingressar na UAST (SiSU/ENEM)',
      categoryId: catEscolas.id,
      pageId: pageCursos.id,
      order: 2,
      isActive: true,
    },
  });

  // Itens da Categoria 3: Comunicação
  await prisma.menuItem.create({
    data: {
      title: 'Todas as Notícias e Comunicados',
      categoryId: catComunica.id,
      url: '/noticias',
      order: 1,
      isActive: true,
    },
  });

  await prisma.menuItem.create({
    data: {
      title: 'Diretrizes de Acessibilidade',
      categoryId: catComunica.id,
      pageId: pageAcessibilidade.id,
      order: 2,
      isActive: true,
    },
  });
  console.log('✓ Categorias e itens de menu em cascata criados.');

  // 5. Notícias Iniciais: 3 com destaque (para o carrossel) e 2 adicionais
  const newsData = [
    {
      title: 'SOU+UAST abre calendário 2025 de visitas guiadas para escolas de Serra Talhada e região',
      slug: 'sou-uast-abre-calendario-2025-visitas-guiadas',
      summary: 'Escolas de ensino médio e fundamental já podem solicitar agendamento gratuito para conhecer os laboratórios, cursos e instalações da UAST/UFRPE.',
      featuredImage: '/images/news/noticia-1.svg',
      isFeatured: true, // Destaque 1 para o carrossel
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 horas atrás
      content: '<p>A coordenação do projeto de extensão <strong>SOU+UAST</strong> anunciou a abertura oficial do cronograma de visitas orientadas para o ano letivo de 2025. O programa é direcionado a instituições escolares públicas e privadas de Serra Talhada, Triunfo, Santa Cruz da Baixa Verde, Flores, Calumbi e demais municípios do Sertão do Pajeú.</p><p>Durante a visita, os estudantes do 9º ano ao 3º ano do Ensino Médio vivenciam um dia completo na vida universitária: acompanham experimentos práticos nos laboratórios de biologia, química e solos, conhecem os protótipos de robótica de Sistemas de Informação e dialogam com professores e estudantes cotistas sobre o ingresso pelo SiSU.</p><blockquote>"Nosso grande foco é mostrar que a universidade pública pertence à sociedade sertaneja. Estudar numa federal perto de casa com qualidade acadêmica é um direito e uma realidade transformadora", destacou a coordenação do projeto.</blockquote><p>Para agendar sua turma, a equipe gestora da escola deve acessar a aba de agendamentos ou enviar uma solicitação pelo e-mail institucional do projeto.</p>',
    },
    {
      title: 'Oficinas do SOU+UAST alcançam mais de 1.200 estudantes em feiras de ciências municipais',
      slug: 'oficinas-sou-uast-alcancam-mais-de-1200-estudantes',
      summary: 'Estudantes e professores da UAST levaram experimentos interativos e orientações sobre carreiras acadêmicas para polos educacionais do Pajeú.',
      featuredImage: '/images/news/noticia-2.svg',
      isFeatured: true, // Destaque 2 para o carrossel
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 28), // Ontem
      content: '<p>As ações itinerantes do projeto <strong>SOU+UAST</strong> bateram recorde de participação no último trimestre, contabilizando mais de 1.200 estudantes atendidos diretamente em feiras vocacionais, semanas científicas e encontros escolares da região.</p><p>A comitiva da UAST participou com stands temáticos onde os jovens puderam manipular lupas estereoscópicas para observar a flora da Caatinga, conhecer espécimes aquícolas monitorados na Engenharia de Pesca e entender o manejo zootécnico e agronômico moderno.</p><p>Além da demonstração científica, foram distribuídos guias informativos sobre as notas de corte do SiSU e os programas federais de auxílio-alimentação e transporte estudantil oferecidos pela Pró-Reitoria de Assuntos Estudantis da UFRPE.</p>',
    },
    {
      title: 'UAST/UFRPE completa 19 anos de ensino público, gratuito e excelência no Sertão Pernambucano',
      slug: 'uast-ufrpe-completa-19-anos-de-ensino-publico',
      summary: 'Com 9 cursos de graduação e programas de pós-graduação, campus se consolida como motor de inovação e inclusão social na região.',
      featuredImage: '/images/news/noticia-3.svg',
      isFeatured: true, // Destaque 3 para o carrossel
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 dias atrás
      content: '<p>A Unidade Acadêmica de Serra Talhada (UAST) celebra seus 19 anos de história consolidando-se como um polo indispensável de desenvolvimento no semiárido brasileiro. Com mais de dois mil estudantes matriculados e centenas de pesquisas com impacto direto na agricultura familiar, piscicultura e educação regional, a UAST comemora sua trajetória de inclusão social e excelência.</p><p>Neste marco festivo, o projeto de extensão <strong>SOU+UAST</strong> reforça sua missão contínua de amplificar a voz da universidade junto à juventude sertaneja, incentivando os jovens da região a ocuparem as salas de aula e os laboratórios da universidade.</p>',
    },
    {
      title: 'Guia do SiSU: Dicas do SOU+UAST para estudantes concorrerem às vagas gratuitas na UAST',
      slug: 'guia-sisu-dicas-estudantes-vagas-gratuitas-uast',
      summary: 'Confira passo a passo como utilizar a nota do ENEM para ingressar nos cursos de graduação da Unidade Acadêmica de Serra Talhada.',
      featuredImage: '/images/news/noticia-4.svg',
      isFeatured: false, // Notícia regular (fora do carrossel)
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 120), // 5 dias atrás
      content: '<p>O ingresso nos cursos de graduação presenciais da UAST/UFRPE ocorre anualmente por meio do <strong>Sistema de Seleção Unificada (SiSU)</strong> do Ministério da Educação, utilizando a pontuação obtida no Exame Nacional do Ensino Médio (ENEM).</p><p>O projeto SOU+UAST preparou uma série de orientações essenciais para que candidatos de escolas públicas aproveitem plenamente as cotas da Lei Federal nº 12.711/2012 e verifiquem a documentação necessária com antecedência.</p>',
    },
    {
      title: 'Rascunho de edital de monitoria voluntária do SOU+UAST para o próximo semestre',
      slug: 'rascunho-edital-monitoria-voluntaria-sou-uast',
      summary: 'Edital interno para seleção de estudantes da graduação interessados em atuar como monitores e apresentadores do projeto.',
      featuredImage: '/images/news/noticia-1.svg',
      isFeatured: false,
      status: 'DRAFT', // Rascunho para testes de permissão editor/admin
      publishedAt: new Date(),
      content: '<p>Este é um documento de trabalho preliminar para planejamento interno da coordenação do projeto.</p>',
    },
  ];

  for (const item of newsData) {
    await prisma.news.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        summary: item.summary,
        featuredImage: item.featuredImage,
        isFeatured: item.isFeatured,
        status: item.status,
        publishedAt: item.publishedAt,
        content: item.content,
      },
      create: {
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: item.content,
        featuredImage: item.featuredImage,
        isFeatured: item.isFeatured,
        status: item.status,
        publishedAt: item.publishedAt,
        authorId: adminUser.id,
      },
    });
  }
  console.log('✓ Notícias iniciais cadastradas (incluindo 3 destaques com capa para o carrossel e 1 rascunho).');

  // 6. Log de Auditoria Inicial
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userName: adminUser.name,
      userEmail: adminUser.email,
      action: 'SEED_INITIALIZE',
      entityType: 'Sistema',
      details: 'Inicialização completa da base de dados institucional do SOU+UAST com usuários, páginas, menu e notícias.',
    },
  });
  console.log('✓ Registro de auditoria inicial gravado.');

  console.log('--- Seed finalizado com sucesso! ---');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
