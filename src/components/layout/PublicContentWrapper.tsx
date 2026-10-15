'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import CascadeSidebar from './CascadeSidebar';
import { CategoryWithItems } from '@/types';

interface PublicContentWrapperProps {
  categories: CategoryWithItems[];
  children: React.ReactNode;
}

export default function PublicContentWrapper({
  categories,
  children,
}: PublicContentWrapperProps) {
  const pathname = usePathname();

  // A página de login é um formulário de autenticação focado e não utiliza o menu lateral institucional
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
        {/* Menu Lateral Esquerdo em Cascata compartilhado (Item 1 e 6) */}
        <CascadeSidebar categories={categories} />

        {/* Área Central de Conteúdo */}
        <div className="flex-1 w-full min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
