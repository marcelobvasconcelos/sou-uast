import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-gray-200 shadow-lg">
        <div className="w-16 h-16 rounded-full bg-ufrpe-blue-50 text-ufrpe-blue-800 flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-ufrpe-green-700 uppercase tracking-widest block">
            Erro 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-ufrpe-blue-900">
            Página Não Encontrada
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            O endereço digitado não existe ou o conteúdo foi remanejado para outra seção do portal institucional.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-ufrpe-blue-800 hover:bg-ufrpe-blue-900 text-white text-sm font-bold rounded-lg shadow transition"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </Link>
          <Link
            href="/noticias"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 hover:bg-slate-50 text-gray-700 text-sm font-bold rounded-lg transition"
          >
            <span>Ver Notícias</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
