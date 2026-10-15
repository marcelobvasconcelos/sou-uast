import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '@/types';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Navegação estrutural (Breadcrumb)" className="py-3 px-4 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center flex-wrap text-xs md:text-sm text-gray-600 gap-1.5">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-ufrpe-blue-800 transition focus:outline-none focus:ring-1 focus:ring-ufrpe-blue-700 rounded px-1"
          title="Ir para a página inicial"
        >
          <Home className="w-3.5 h-3.5 text-gray-500" />
          <span>Início</span>
        </Link>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" aria-hidden="true" />
              {isLast || !item.href ? (
                <span className="font-semibold text-ufrpe-blue-900 truncate max-w-xs sm:max-w-md" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-ufrpe-blue-800 transition focus:outline-none focus:ring-1 focus:ring-ufrpe-blue-700 rounded px-1"
                >
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
