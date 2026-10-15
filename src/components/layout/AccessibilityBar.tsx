'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Sun, Moon, ZoomIn, ZoomOut, Lock, UserCheck, LogOut, LayoutDashboard } from 'lucide-react';

export default function AccessibilityBar() {
  const { data: session, status } = useSession();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(0); // -1, 0, 1, 2

  useEffect(() => {
    // Carregar preferências salvas do usuário
    const savedContrast = localStorage.getItem('sou_uast_contrast');
    if (savedContrast === 'high') {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }

    const savedFont = localStorage.getItem('sou_uast_font_size');
    if (savedFont) {
      const level = parseInt(savedFont, 10);
      if (!isNaN(level)) {
        setFontSizeLevel(level);
        applyFontSize(level);
      }
    }

    // Atalhos de teclado (Alt + 1, Alt + 2, Alt + 3)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        const main = document.getElementById('conteudo-principal');
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        const nav = document.getElementById('menu-principal');
        if (nav) {
          nav.focus();
          nav.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        const footer = document.getElementById('rodape-institucional');
        if (footer) {
          footer.focus();
          footer.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    if (next) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('sou_uast_contrast', 'high');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('sou_uast_contrast', 'normal');
    }
  };

  const applyFontSize = (level: number) => {
    const html = document.documentElement;
    html.classList.remove('text-size-sm', 'text-size-base', 'text-size-lg', 'text-size-xl');
    if (level === 1) html.classList.add('text-size-lg');
    else if (level === 2) html.classList.add('text-size-xl');
    else if (level === -1) html.classList.add('text-size-sm');
    else html.classList.add('text-size-base');
  };

  const increaseFont = () => {
    setFontSizeLevel((prev) => {
      const next = Math.min(prev + 1, 2);
      applyFontSize(next);
      localStorage.setItem('sou_uast_font_size', next.toString());
      return next;
    });
  };

  const decreaseFont = () => {
    setFontSizeLevel((prev) => {
      const next = Math.max(prev - 1, -1);
      applyFontSize(next);
      localStorage.setItem('sou_uast_font_size', next.toString());
      return next;
    });
  };

  return (
    <div className="bg-ufrpe-blue-900 text-slate-100 text-xs py-1.5 px-4 border-b border-ufrpe-blue-800" role="region" aria-label="Barra de Acessibilidade e Navegação">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Atalhos para leitores de tela e teclado */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <a
            href="#conteudo-principal"
            className="hover:underline focus:ring-2 focus:ring-yellow-400 focus:outline-none py-0.5 px-1.5 rounded transition"
            title="Ir para o conteúdo principal (Alt + 1)"
          >
            Ir para conteúdo <span className="text-yellow-300 font-bold">[1]</span>
          </a>
          <a
            href="#menu-principal"
            className="hidden sm:inline hover:underline focus:ring-2 focus:ring-yellow-400 focus:outline-none py-0.5 px-1.5 rounded transition"
            title="Ir para o menu de navegação (Alt + 2)"
          >
            Ir para menu <span className="text-yellow-300 font-bold">[2]</span>
          </a>
          <a
            href="#rodape-institucional"
            className="hidden sm:inline hover:underline focus:ring-2 focus:ring-yellow-400 focus:outline-none py-0.5 px-1.5 rounded transition"
            title="Ir para o rodapé (Alt + 3)"
          >
            Ir para rodapé <span className="text-yellow-300 font-bold">[3]</span>
          </a>
        </div>

        {/* Controles de Acessibilidade e Acesso do Editor */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Alto Contraste */}
          <button
            onClick={toggleContrast}
            type="button"
            className="flex items-center gap-1.5 py-0.5 px-2 rounded hover:bg-ufrpe-blue-800 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
            aria-pressed={isHighContrast}
            title={isHighContrast ? 'Desativar Alto Contraste' : 'Ativar Alto Contraste'}
          >
            {isHighContrast ? <Sun className="w-3.5 h-3.5 text-yellow-300" /> : <Moon className="w-3.5 h-3.5" />}
            <span>Contraste</span>
          </button>

          {/* Ajuste de Fonte */}
          <div className="flex items-center space-x-1 border-l border-r border-ufrpe-blue-800 px-2">
            <button
              onClick={decreaseFont}
              type="button"
              className="py-0.5 px-1.5 rounded hover:bg-ufrpe-blue-800 focus:ring-2 focus:ring-yellow-400 focus:outline-none font-bold"
              title="Diminuir tamanho da fonte"
              aria-label="Diminuir fonte"
            >
              A-
            </button>
            <button
              onClick={increaseFont}
              type="button"
              className="py-0.5 px-1.5 rounded hover:bg-ufrpe-blue-800 focus:ring-2 focus:ring-yellow-400 focus:outline-none font-bold"
              title="Aumentar tamanho da fonte"
              aria-label="Aumentar fonte"
            >
              A+
            </button>
          </div>

          <Link
            href="/pagina/acessibilidade"
            className="hidden md:inline hover:underline focus:ring-2 focus:ring-yellow-400 focus:outline-none py-0.5 px-1 rounded"
            title="Conheça nossos recursos de acessibilidade"
          >
            Acessibilidade
          </Link>

          {/* Acesso Discreto para Editores e Administradores (Item 2 dos Requisitos) */}
          <div className="border-l border-ufrpe-blue-800 pl-3">
            {status === 'authenticated' && session?.user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-yellow-300 hover:text-yellow-200 font-semibold focus:ring-2 focus:ring-yellow-400 focus:outline-none py-0.5 px-1 rounded transition"
                  title="Acessar o Painel Administrativo"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Painel ({session.user.name?.split(' ')[0]})</span>
                  <span className="sm:hidden">Painel</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-slate-300 hover:text-white p-0.5 rounded focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                  title="Sair do sistema"
                  aria-label="Sair"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-slate-300 hover:text-white font-medium focus:ring-2 focus:ring-yellow-400 focus:outline-none py-0.5 px-1.5 rounded transition opacity-80 hover:opacity-100"
                title="Acesso de Editores e Administradores"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span className="text-[11px]">Acesso Restrito</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
