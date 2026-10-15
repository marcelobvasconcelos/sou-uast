'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Newspaper, GraduationCap, Info, CalendarCheck, Home } from 'lucide-react';
import { getAssetUrl } from '@/lib/api-client';

interface HeaderProps {
  siteName?: string;
  logoSouUast?: string | null;
  logoUfrpe?: string | null;
}

export default function Header({
  siteName = 'SOU+UAST',
  logoSouUast = '/images/logo-sou-uast.svg',
  logoUfrpe = '/images/logo-ufrpe.svg',
}: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Notícias', href: '/noticias', icon: Newspaper },
    { label: 'Sobre o Projeto', href: '/pagina/sobre-o-projeto', icon: Info },
    { label: 'A UAST/UFRPE', href: '/pagina/a-instituicao-uast', icon: GraduationCap },
    { label: 'Cursos', href: '/pagina/cursos-de-graduacao', icon: GraduationCap },
    { label: 'Visitas Guiadas', href: '/pagina/visitas-guiadas', icon: CalendarCheck },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logotipos Institucionais Lado a Lado */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <Link
              href="/"
              className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-ufrpe-blue-700 rounded-md p-1 transition"
              title={`Página Inicial do portal institucional ${siteName}`}
            >
              <div className="relative h-12 w-44 sm:h-14 sm:w-52">
                <Image
                  src={getAssetUrl(logoSouUast || '/images/logo-sou-uast.svg')}
                  alt="Logotipo do Projeto de Extensão SOU+UAST"
                  fill
                  sizes="(max-width: 640px) 176px, 208px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            <div className="hidden sm:block h-10 w-[1px] bg-gray-300" aria-hidden="true" />

            <Link
              href="https://uast.ufrpe.br"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block focus:outline-none focus:ring-2 focus:ring-ufrpe-green-700 rounded-md p-1 transition"
              title="Acessar o portal oficial da UAST/UFRPE (site institucional externo - abre em nova aba)"
            >
              <div className="relative h-11 w-36 sm:h-12 sm:w-44">
                <Image
                  src={getAssetUrl(logoUfrpe || '/images/logo-ufrpe.svg')}
                  alt="Logotipo institucional da UAST / UFRPE"
                  fill
                  sizes="176px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Navegação Desktop */}
          <nav
            id="menu-principal"
            className="hidden lg:flex items-center space-x-1"
            aria-label="Menu principal de navegação"
          >
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ufrpe-blue-700 ${
                    active
                      ? 'bg-ufrpe-blue-800 text-white shadow-sm'
                      : 'text-gray-700 hover:text-ufrpe-blue-800 hover:bg-slate-100'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Botão Hambúrguer Mobile */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-ufrpe-blue-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ufrpe-blue-700"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            >
              {mobileMenuOpen ? <X className="block h-7 w-7" /> : <Menu className="block h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Retrátil */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden border-t border-gray-200 bg-white shadow-lg animate-fadeIn">
          <div className="px-4 pt-3 pb-5 space-y-1">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium transition ${
                    active
                      ? 'bg-ufrpe-blue-800 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-ufrpe-blue-800'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 border-t border-gray-100 mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>UAST • Serra Talhada / PE</span>
              <Link
                href="https://uast.ufrpe.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ufrpe-green-700 font-semibold hover:underline"
              >
                Portal UAST ↗
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
