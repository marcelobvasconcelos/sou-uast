'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { getAssetUrl, BASE_PATH } from '@/lib/api-client';
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  Menu as MenuIcon,
  Settings,
  Users,
  ShieldAlert,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  History,
  GraduationCap,
  HelpCircle
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = session?.user?.role === 'ADMIN';

  const menuItems = [
    { label: 'Painel Geral', href: '/admin', icon: LayoutDashboard },
    { label: 'Notícias & Destaques', href: '/admin/noticias', icon: Newspaper },
    { label: 'Páginas Institucionais', href: '/admin/paginas', icon: FileText },
    { label: 'Menu em Cascata', href: '/admin/menu', icon: MenuIcon },
    { label: 'Equipe do Projeto', href: '/admin/equipe', icon: GraduationCap },
    { label: 'Configurações do Site', href: '/admin/configuracoes', icon: Settings },
    // Apenas Administrador
    ...(isAdmin
      ? [
          { label: 'Usuários & Papéis', href: '/admin/usuarios', icon: Users },
          { label: 'Log de Auditoria', href: '/admin/auditoria', icon: History },
        ]
      : []),
    { label: 'Ajuda', href: '/admin/ajuda', icon: HelpCircle },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-ufrpe-blue-900 text-white flex-shrink-0 border-r border-ufrpe-blue-800 shadow-md">
        {/* Logo / Header da Sidebar */}
        <div className="p-5 border-b border-ufrpe-blue-800 bg-ufrpe-blue-950">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center flex-shrink-0">
              <Image
                src={getAssetUrl('/images/logo-sou-uast.svg')}
                alt="SOU+UAST"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wide text-white block">SOU+UAST</span>
              <span className="text-[10px] text-ufrpe-green-300 font-semibold uppercase tracking-wider block">
                Painel Administrativo
              </span>
            </div>
          </Link>
        </div>

        {/* Links de Navegação */}
        <nav className="p-4 space-y-1.5 flex-grow" aria-label="Navegação Administrativa">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                  active
                    ? 'bg-ufrpe-blue-800 text-yellow-300 shadow-sm border-l-4 border-yellow-400'
                    : 'text-slate-300 hover:bg-ufrpe-blue-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-yellow-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="w-4 h-4 text-yellow-300" />}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar com perfil e logout */}
        <div className="p-4 border-t border-ufrpe-blue-800 bg-ufrpe-blue-950/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-ufrpe-green-700 text-white font-bold flex items-center justify-center text-xs">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{session?.user?.name}</p>
              <span
                className={`inline-block px-1.5 py-0.2 text-[10px] rounded font-bold uppercase tracking-wider ${
                  isAdmin ? 'bg-amber-400 text-black' : 'bg-ufrpe-green-400 text-black'
                }`}
              >
                {isAdmin ? 'Administrador' : 'Editor'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-ufrpe-blue-800/80">
            <Link
              href="/"
              target="_blank"
              className="flex-grow flex items-center justify-center gap-1.5 py-1.5 px-2 bg-ufrpe-blue-800 hover:bg-ufrpe-blue-700 text-slate-200 text-xs font-semibold rounded transition"
            >
              <span>Ver Site</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: BASE_PATH ? `${BASE_PATH}/login` : '/login' })}
              className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded transition"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Header Mobile do Painel */}
      <div className="md:hidden bg-ufrpe-blue-900 text-white p-4 flex items-center justify-between shadow">
        <Link href="/admin" className="font-extrabold text-sm flex items-center gap-2">
          <span>SOU+UAST</span>
          <span className="text-[10px] text-ufrpe-green-300 font-semibold px-2 py-0.5 rounded bg-ufrpe-blue-950">
            PAINEL
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          type="button"
          className="p-1.5 rounded bg-ufrpe-blue-800 text-white"
          aria-label="Abrir menu lateral administrativo"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu Gaveta Mobile */}
      {sidebarOpen && (
        <div className="md:hidden bg-ufrpe-blue-900 text-white p-4 space-y-2 border-b border-ufrpe-blue-800 shadow-xl">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded text-sm text-slate-200 hover:bg-ufrpe-blue-800"
            >
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="pt-3 border-t border-ufrpe-blue-800 flex justify-between items-center text-xs">
            <Link href="/" target="_blank" className="text-yellow-300 font-semibold">
              Ver Site Público ↗
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: BASE_PATH ? `${BASE_PATH}/login` : '/login' })}
              className="text-red-400 font-semibold"
            >
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal do Painel */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
