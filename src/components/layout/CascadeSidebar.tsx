'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Layers, ExternalLink, Menu, X } from 'lucide-react';
import { CategoryWithItems, MenuItemData } from '@/types';

interface CascadeSidebarProps {
  categories: CategoryWithItems[];
  currentSlug?: string;
}

export default function CascadeSidebar({ categories, currentSlug }: CascadeSidebarProps) {
  const pathname = usePathname();
  const [mobileExpanded, setMobileExpanded] = useState(false);
  // Mantém controle de quais itens/categorias estão expandidos
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((cat) => {
      initial[cat.id] = true; // Por padrão, categorias abertas
    });
    return initial;
  });

  const [expandedSubmenus, setExpandedSubmenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((cat) => {
      cat.menuItems.forEach((item) => {
        if (item.children && item.children.length > 0) {
          initial[item.id] = true; // Abre se tiver subitens
        }
      });
    });
    return initial;
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleSubmenu = (itemId: string) => {
    setExpandedSubmenus((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const activeSlug =
    currentSlug ||
    (pathname.startsWith('/pagina/') ? pathname.replace('/pagina/', '') : undefined);

  const isItemActive = (item: MenuItemData) => {
    if (item.pageSlug && activeSlug === item.pageSlug) return true;
    if (item.url && pathname === item.url) return true;
    if (item.pageSlug && pathname === `/pagina/${item.pageSlug}`) return true;
    return false;
  };

  const renderMenuItem = (item: MenuItemData, level: number = 0) => {
    const active = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isSubmenuOpen = !!expandedSubmenus[item.id];

    const linkHref = item.pageSlug
      ? `/pagina/${item.pageSlug}`
      : item.url || '#';

    return (
      <li key={item.id} className="space-y-1">
        <div
          className={`flex items-center justify-between group rounded-md text-sm transition ${
            active
              ? 'bg-ufrpe-blue-800 text-white font-semibold shadow-sm'
              : 'text-gray-700 hover:bg-slate-100 hover:text-ufrpe-blue-800'
          } ${level > 0 ? 'ml-4 pl-2 border-l-2 border-gray-200' : ''}`}
        >
          <Link
            href={linkHref}
            target={item.openInNewTab ? '_blank' : undefined}
            rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
            onClick={() => setMobileExpanded(false)}
            className="flex-grow py-2 px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-ufrpe-blue-700 rounded-l-md"
            aria-current={active ? 'page' : undefined}
          >
            <span className="truncate">{item.title}</span>
            {item.openInNewTab && <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-1.5 flex-shrink-0" />}
          </Link>

          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleSubmenu(item.id);
              }}
              className={`p-2 rounded-r-md hover:bg-black/10 focus:outline-none focus:ring-1 ${
                active ? 'text-white' : 'text-gray-500'
              }`}
              aria-label={isSubmenuOpen ? `Recolher submenu de ${item.title}` : `Expandir submenu de ${item.title}`}
              aria-expanded={isSubmenuOpen}
            >
              {isSubmenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Subitens em cascata (nível 2) */}
        {hasChildren && isSubmenuOpen && (
          <ul className="space-y-1 mt-1" role="group">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      {/* Botão Mobile para Expandir Menu Cascata */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileExpanded(!mobileExpanded)}
          type="button"
          className="w-full flex items-center justify-between p-3.5 bg-ufrpe-blue-800 text-white rounded-lg shadow-sm font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ufrpe-blue-700"
          aria-expanded={mobileExpanded}
          aria-controls="cascade-sidebar-content"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Navegação Institucional</span>
          </div>
          {mobileExpanded ? <X className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Conteúdo do Menu em Cascata */}
      <div
        id="cascade-sidebar-content"
        className={`${
          mobileExpanded ? 'block mb-6' : 'hidden'
        } lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-28`}
      >
        <div className="bg-gradient-to-r from-ufrpe-blue-900 to-ufrpe-blue-800 p-4 text-white">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-ufrpe-green-400" />
            <h2 className="font-bold text-base tracking-wide">Menu Institucional</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">Navegue pelas seções e páginas do SOU+UAST</p>
        </div>

        <nav className="p-3 divide-y divide-gray-100" aria-label="Menu lateral institucional">
          {categories.map((category) => {
            const isOpen = !!expandedCategories[category.id];
            // Filtrar apenas itens raiz desta categoria (que não têm parentId)
            const rootItems = category.menuItems.filter((i) => !i.parentId);

            return (
              <div key={category.id} className="py-2.5 first:pt-1 last:pb-1">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between text-left text-xs uppercase tracking-wider font-bold text-ufrpe-green-800 hover:text-ufrpe-green-700 py-1 px-2 rounded focus:outline-none focus:ring-1 focus:ring-ufrpe-green-600 transition"
                  aria-expanded={isOpen}
                >
                  <span>{category.name}</span>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>

                {isOpen && (
                  <ul className="mt-2 space-y-1">
                    {rootItems.length > 0 ? (
                      rootItems.map((item) => renderMenuItem(item))
                    ) : (
                      <li className="text-xs text-gray-400 italic px-2 py-1">Nenhum item nesta seção.</li>
                    )}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
