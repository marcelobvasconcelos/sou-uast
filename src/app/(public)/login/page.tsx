'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, Mail, AlertCircle, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { getAssetUrl } from '@/lib/api-client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, informe seu e-mail e senha institucional.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim(),
        password,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMessage(res.error || 'Credenciais inválidas. Verifique os dados digitados.');
      } else if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage('Ocorreu um erro inesperado ao conectar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-gray-200 shadow-xl">
      {/* Topo / Logo */}
      <div className="text-center space-y-3">
        <Link href="/" className="inline-block p-2 rounded-lg hover:bg-slate-50 transition">
          <Image
            src={getAssetUrl('/images/logo-sou-uast.svg')}
            alt="Logo SOU+UAST"
            width={220}
            height={55}
            className="mx-auto"
          />
        </Link>
        <h1 className="text-2xl font-black text-ufrpe-blue-900 tracking-tight">
          Acesso Restrito
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Área de publicação e administração institucional da UAST/UFRPE.
        </p>
      </div>

      {/* Mensagem de Erro */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Formulário de Login */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="block text-xs font-bold text-gray-700 mb-1">
            E-mail Institucional
          </label>
          <div className="relative">
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@ufrpe.br"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ufrpe-blue-700 focus:outline-none"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-bold text-gray-700 mb-1">
            Senha de Acesso
          </label>
          <div className="relative">
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ufrpe-blue-700 focus:outline-none"
            />
            <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-ufrpe-blue-800 hover:bg-ufrpe-blue-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-ufrpe-blue-300 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Autenticando...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Entrar no Painel</span>
            </>
          )}
        </button>
      </form>

      {/* Informações de Demonstração / Seed para Avaliação */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
        <p className="font-bold text-ufrpe-blue-900 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-ufrpe-green-600" />
          <span>Credenciais Pré-configuradas (Seed):</span>
        </p>
        <div className="space-y-1 font-mono text-[11px] bg-white p-2.5 rounded border border-gray-200">
          <div>
            <strong className="text-gray-800">Admin:</strong> admin@ufrpe.br | Admin@SouUast2025
          </div>
          <div>
            <strong className="text-gray-800">Editor:</strong> editor@ufrpe.br | Editor@SouUast2025
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-ufrpe-blue-800 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para o portal público</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="p-8 text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-ufrpe-blue-800 mb-2" />
          <span>Carregando área de autenticação...</span>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
