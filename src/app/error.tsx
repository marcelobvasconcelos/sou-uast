'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erro de aplicação capturado:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-red-200 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">
            Erro Inesperado
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Falha no Carregamento
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Ocorreu uma instabilidade momentânea na resposta do sistema. Nossa equipe técnica já foi notificada.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-ufrpe-blue-800 hover:bg-ufrpe-blue-900 text-white text-sm font-bold rounded-lg shadow transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 hover:bg-slate-50 text-gray-700 text-sm font-bold rounded-lg transition"
          >
            <Home className="w-4 h-4" />
            <span>Página Inicial</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
