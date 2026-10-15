/**
 * Conteúdo da Central de Ajuda do portal SOU+UAST.
 * Organizado por perfil de acesso para facilitar manutenções futuras
 * sem necessidade de alterar componentes de interface.
 * 
 * Regra: Todo o texto segue estritamente o padrão institucional e não utiliza emojis.
 */

export type RoleAccess = 'ADMIN' | 'EDITOR' | 'VISITOR';

export interface HelpSection {
  id: string;
  title: string;
  category: 'GERAL' | 'EDITOR' | 'ADMIN' | 'SISTEMA';
  allowedRoles: RoleAccess[];
  content?: string;
  steps?: string[];
  subItems?: Array<{ label: string; text: string }>;
}

export const HELP_SECTIONS: HelpSection[] = [
  // 1. Visão Geral e Funcionamento do Sistema (Público, Editor e Admin)
  {
    id: 'como-funciona',
    title: 'Como este sistema funciona',
    category: 'GERAL',
    allowedRoles: ['VISITOR', 'EDITOR', 'ADMIN'],
    content:
      'O SOU+UAST é o portal do projeto de extensão da UAST/UFRPE. Qualquer pessoa pode consultar o site sem login. As funções de administração ficam disponíveis apenas para usuários cadastrados, e cada usuário vê somente o que o seu perfil permite. Quando uma ação não é permitida, o sistema bloqueia e avisa o motivo.',
  },
  {
    id: 'perfis-acesso',
    title: 'Perfis de acesso',
    category: 'GERAL',
    allowedRoles: ['VISITOR', 'EDITOR', 'ADMIN'],
    steps: [
      '1. Visitante, sem login: só consulta o site.',
      '2. Editor de Conteúdo: prepara e publica notícias.',
      '3. Administrador: faz tudo, inclusive gerenciar pessoas e aparência.',
    ],
  },

  // 2. Instruções do Editor de Conteúdo (Editor e Admin)
  {
    id: 'editor-o-que-pode-fazer',
    title: 'Editor de Conteúdo, o que pode fazer',
    category: 'EDITOR',
    allowedRoles: ['EDITOR', 'ADMIN'],
    content:
      'Entrar no painel com e-mail e senha. Criar notícias com título, texto e imagem. Editar qualquer notícia. Salvar rascunho e publicar quando estiver pronto. Excluir notícias. Trocar a imagem de capa de uma notícia. Enviar imagens para o sistema. Visualizar a notícia antes de publicar.',
  },
  {
    id: 'editor-como-publicar',
    title: 'Editor, como publicar uma notícia',
    category: 'EDITOR',
    allowedRoles: ['EDITOR', 'ADMIN'],
    steps: [
      '1. Faça login com seu e-mail institucional.',
      '2. No painel, clique em Notícias e depois em Nova notícia.',
      '3. Escreva o título e o texto.',
      '4. Clique em Enviar imagem e escolha a foto.',
      '5. Salve o rascunho, confira a visualização e clique em Publicar.',
    ],
  },
  {
    id: 'editor-como-trocar-imagem',
    title: 'Editor, como trocar a imagem de uma notícia',
    category: 'EDITOR',
    allowedRoles: ['EDITOR', 'ADMIN'],
    steps: [
      '1. No painel, abra a notícia desejada.',
      '2. Clique na imagem atual e escolha a nova foto.',
      '3. Salve e confira a publicação.',
    ],
  },
  {
    id: 'editor-limitacoes',
    title: 'Editor, limitações',
    category: 'EDITOR',
    allowedRoles: ['EDITOR', 'ADMIN'],
    content:
      'Não cria, edita ou remove usuários. Não altera os menus do site nem a logo. Se uma ação bloquear com a mensagem de sem permissão, procure um administrador.',
  },

  // 3. Instruções do Administrador (Apenas Admin)
  {
    id: 'administrador-visao-geral',
    title: 'Administrador',
    category: 'ADMIN',
    allowedRoles: ['ADMIN'],
    content:
      'O administrador faz tudo o que o Editor faz, e ainda: criar usuários do painel, definir o papel de cada pessoa, corrigir o papel de quem foi cadastrado sem permissão, desativar acesso de quem saiu da equipe, alterar a logo do site, organizar os menus de navegação e gerenciar a equipe exibida na página pública.',
  },
  {
    id: 'administrador-como-criar-usuario',
    title: 'Administrador, como criar um usuário',
    category: 'ADMIN',
    allowedRoles: ['ADMIN'],
    steps: [
      '1. No painel, acesse Usuários.',
      '2. Clique em Novo usuário.',
      '3. Preencha nome, e-mail e escolha o papel.',
      '4. Salve e oriente a pessoa a usar a recuperação de senha no primeiro acesso.',
    ],
  },
  {
    id: 'administrador-como-trocar-logo',
    title: 'Administrador, como trocar a logo',
    category: 'ADMIN',
    allowedRoles: ['ADMIN'],
    steps: [
      '1. No painel, acesse a área de identidade visual ou configurações.',
      '2. Envie o arquivo da nova logo.',
      '3. Salve e recarregue a página inicial para conferir.',
    ],
  },
  {
    id: 'administrador-cuidados',
    title: 'Administrador, cuidados',
    category: 'ADMIN',
    allowedRoles: ['ADMIN'],
    content:
      'As alterações de administrador afetam o site inteiro e ficam visíveis ao público na hora. Antes de excluir uma notícia ou usuário, confirme se ninguém depende daquele conteúdo. Prefira e-mails institucionais no cadastro.',
  },

  // 4. Seções Gerais do Sistema para Usuários Autenticados (Editor e Admin)
  {
    id: 'mensagens-de-erro',
    title: 'Mensagens de erro e o que significam',
    category: 'SISTEMA',
    allowedRoles: ['EDITOR', 'ADMIN'],
    subItems: [
      {
        label: 'Sua sessão expirou',
        text: 'faça login novamente e repita a ação.',
      },
      {
        label: 'Você não tem permissão',
        text: 'seu perfil não permite a operação, procure um administrador.',
      },
      {
        label: 'Não encontramos o que você procura',
        text: 'o conteúdo pode ter sido excluído ou o endereço está errado, volte ao painel.',
      },
      {
        label: 'O arquivo é muito grande',
        text: 'reduza o tamanho da imagem e tente de novo.',
      },
      {
        label: 'Erro interno do servidor',
        text: 'aguarde um instante e tente de novo, se persistir informe o suporte.',
      },
    ],
  },
  {
    id: 'seguranca-boas-praticas',
    title: 'Segurança e boas práticas',
    category: 'SISTEMA',
    allowedRoles: ['EDITOR', 'ADMIN'],
    content:
      'Nunca compartilhe sua senha. Em computador coletivo, sempre clique em Sair ao terminar. Use senha forte, com letras, números e símbolos. Revise o texto antes de publicar, pois o que é publicado aparece na hora para todo mundo. Em caso de suspeita de acesso indevido, avise um administrador.',
  },
  {
    id: 'perguntas-frequentes',
    title: 'Perguntas frequentes',
    category: 'SISTEMA',
    allowedRoles: ['EDITOR', 'ADMIN'],
    subItems: [
      {
        label: 'Fiz login, mas não vejo os botões de administrador',
        text: 'seu usuário pode ter papel de editor, peça a um administrador para ajustar em Usuários.',
      },
      {
        label: 'Publiquei uma notícia e ela não aparece',
        text: 'confira se ficou em rascunho, atualize a página e, se persistir, informe o suporte.',
      },
      {
        label: 'Posso recuperar uma notícia apagada',
        text: 'o sistema não mantém lixeira, por isso confirme antes de excluir; em casos graves, o suporte pode verificar no servidor.',
      },
      {
        label: 'Esqueci minha senha',
        text: 'use a recuperação na tela de login ou peça a um administrador.',
      },
    ],
  },
];

/**
 * Filtra as seções de ajuda com base no perfil de acesso do usuário.
 * Executado estritamente no servidor para garantir segurança.
 */
export function getHelpSectionsForRole(role?: RoleAccess | string | null): HelpSection[] {
  const normalizedRole: RoleAccess =
    role === 'ADMIN' ? 'ADMIN' : role === 'EDITOR' ? 'EDITOR' : 'VISITOR';

  return HELP_SECTIONS.filter((section) =>
    section.allowedRoles.includes(normalizedRole)
  );
}
