import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: {
    default: 'SOU+UAST | Projeto de Extensão - UAST / UFRPE',
    template: '%s | SOU+UAST - UFRPE',
  },
  description:
    'Portal institucional do Projeto de Extensão SOU+UAST da Unidade Acadêmica de Serra Talhada (UAST/UFRPE). Divulgação de cursos gratuitos, visitas escolares e notícias.',
  keywords: [
    'SOU+UAST',
    'UAST',
    'UFRPE',
    'Serra Talhada',
    'Projeto de Extensão',
    'Universidade Pública',
    'SiSU',
    'ENEM',
    'Educação',
  ],
  authors: [{ name: 'Unidade Acadêmica de Serra Talhada - UAST / UFRPE' }],
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'SOU+UAST - UAST/UFRPE',
    title: 'SOU+UAST | Projeto de Extensão Universitária',
    description: 'Aproximando a universidade pública das escolas e estudantes do Sertão do Pajeú.',
    images: [
      {
        url: '/images/news/noticia-1.svg',
        width: 1200,
        height: 675,
        alt: 'SOU+UAST - UAST/UFRPE',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-gray-900 font-sans antialiased flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
