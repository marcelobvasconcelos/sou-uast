import React from 'react';
import AccessibilityBar from '@/components/layout/AccessibilityBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PublicContentWrapper from '@/components/layout/PublicContentWrapper';
import { prisma } from '@/lib/prisma';
import { getPublicMenuCategories } from '@/lib/menu';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;
  let categories: any[] = [];

  try {
    settings = await prisma.siteSetting.findUnique({
      where: { id: 'site_settings' },
    });
    categories = await getPublicMenuCategories();
  } catch (e) {
    console.error('Falha ao obter configurações/menu do site para o layout público:', e);
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50">
      <div>
        <AccessibilityBar />
        <Header
          siteName={settings?.siteName}
          logoSouUast={settings?.logoSouUast}
          logoUfrpe={settings?.logoUfrpe}
        />
      </div>

      <main id="conteudo-principal" className="flex-grow focus:outline-none" tabIndex={-1}>
        <PublicContentWrapper categories={categories}>
          {children}
        </PublicContentWrapper>
      </main>

      <Footer settings={settings || undefined} />
    </div>
  );
}
