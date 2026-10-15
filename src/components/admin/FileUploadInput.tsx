'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, CheckCircle2, AlertCircle, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface FileUploadInputProps {
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
  aspectRatioHint?: string;
  maxSizeMb?: number;
  acceptedTypes?: string[];
  helperText?: string;
}

export default function FileUploadInput({
  label,
  value,
  onChange,
  aspectRatioHint = '16:9 (Recomendado 1280x720 ou superior)',
  maxSizeMb = 15,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  helperText = 'Formatos suportados: JPG, PNG ou WebP.',
}: FileUploadInputProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar com mudanças externas
  React.useEffect(() => {
    if (value !== undefined) {
      setPreview(value);
    }
  }, [value]);

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validação de tipo
    if (!acceptedTypes.includes(file.type)) {
      setError(`Tipo de arquivo não permitido. Por favor envie imagens no formato JPG, PNG ou WebP.`);
      return;
    }

    // Validação de tamanho
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`O arquivo selecionado (${(file.size / (1024 * 1024)).toFixed(1)} MB) excede o limite máximo permitido de ${maxSizeMb} MB.`);
      return;
    }

    // Preview local imediato
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // Iniciar upload com barra de progresso real via XMLHttpRequest
    uploadFile(file);
  };

  const uploadFile = (file: File) => {
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      setIsUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.url) {
            onChange(response.url);
            setPreview(response.url);
          } else {
            setError(response.error || 'Erro ao processar resposta do servidor.');
          }
        } catch {
          setError('Erro ao interpretar resposta do upload.');
        }
      } else {
        if (xhr.status === 401) {
          setError('Sua sessão expirou ou não está autenticada. Faça login novamente para enviar arquivos.');
        } else if (xhr.status === 403) {
          setError('Acesso negado: seu usuário não possui permissão para envio de arquivos.');
        } else if (xhr.status === 413) {
          setError(`O arquivo enviado excede o limite máximo configurado no servidor (${maxSizeMb} MB).`);
        } else {
          try {
            const res = JSON.parse(xhr.responseText);
            setError(res.error || `Falha no envio (Código ${xhr.status}).`);
          } catch {
            setError(`Falha na comunicação com o servidor (Código ${xhr.status}).`);
          }
        }
      }
    });

    xhr.addEventListener('error', () => {
      setIsUploading(false);
      setError('Falha de conexão durante o upload da imagem.');
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-gray-700">{label}</label>
        {aspectRatioHint && (
          <span className="text-xs text-ufrpe-blue-800 font-medium bg-ufrpe-blue-50 px-2 py-0.5 rounded">
            Proporção: {aspectRatioHint}
          </span>
        )}
      </div>

      {/* Caixa de Upload / Preview */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center cursor-pointer ${
          error
            ? 'border-red-300 bg-red-50/50'
            : preview
            ? 'border-ufrpe-blue-300 bg-slate-50'
            : 'border-gray-300 hover:border-ufrpe-blue-600 bg-white hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />

        {preview ? (
          <div className="relative w-full aspect-[16/9] max-h-64 rounded-lg overflow-hidden bg-black/5 group">
            <Image
              src={preview}
              alt="Pré-visualização da imagem"
              fill
              unoptimized
              className="object-contain"
            />
            {/* Overlay com botão de remover e trocar */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <span className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-md shadow">
                Clique para trocar
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-600 text-white p-1.5 rounded-md hover:bg-red-700 transition"
                title="Remover imagem"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-ufrpe-blue-50 text-ufrpe-blue-700 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Clique para selecionar ou arraste sua imagem aqui
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {helperText} (Tamanho máximo: {maxSizeMb} MB)
              </p>
            </div>
          </div>
        )}

        {/* Barra de Progresso Real */}
        {isUploading && (
          <div className="w-full mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-ufrpe-blue-800">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Enviando imagem para o servidor...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-ufrpe-green-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mensagem de Erro Clara em Português */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1.5 bg-red-50 p-2 rounded border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sucesso */}
      {preview && !isUploading && !error && (
        <div className="flex items-center gap-1.5 text-xs text-ufrpe-green-700 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Imagem carregada e pronta para publicação.</span>
        </div>
      )}
    </div>
  );
}
