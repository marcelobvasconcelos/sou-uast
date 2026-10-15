'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Save,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowLeft,
  X,
  Calendar,
  AlertTriangle,
  Loader2,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Table as TableIcon
} from 'lucide-react';
import FileUploadInput from './FileUploadInput';
import { slugify, formatDate, estimateReadingTime } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api-errors';
import { ContentStatus } from '@prisma/client';

interface NewsFormData {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featuredImage: string;
  isFeatured: boolean;
  status: ContentStatus;
  publishedAt: string;
}

interface DrupalNewsEditorProps {
  initialData?: Partial<NewsFormData>;
  isEditing?: boolean;
}

export default function DrupalNewsEditor({ initialData, isEditing = false }: DrupalNewsEditorProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<NewsFormData>({
    id: initialData?.id || undefined,
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    featuredImage: initialData?.featuredImage || '',
    isFeatured: initialData?.isFeatured ?? false,
    status: initialData?.status || 'PUBLISHED',
    publishedAt: initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  });

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(initialData?.slug));
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Auto slug quando o título mudar (se não tiver sido editado manualmente)
  useEffect(() => {
    if (!isSlugManuallyEdited && formData.title) {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formData.title, isSlugManuallyEdited]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: isSlugManuallyEdited ? prev.slug : slugify(val),
    }));
  };

  // Funções de formatação rápida do Editor Rico
  const insertFormatting = (tag: string, placeholder = 'Texto formatado') => {
    const textarea = document.getElementById('news-content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || placeholder;

    let insertion = '';
    if (tag === 'b') insertion = `<strong>${selected}</strong>`;
    else if (tag === 'i') insertion = `<em>${selected}</em>`;
    else if (tag === 'h2') insertion = `\n<h2>${selected}</h2>\n`;
    else if (tag === 'h3') insertion = `\n<h3>${selected}</h3>\n`;
    else if (tag === 'ul') insertion = `\n<ul>\n  <li>${selected}</li>\n  <li>Item adicional</li>\n</ul>\n`;
    else if (tag === 'ol') insertion = `\n<ol>\n  <li>${selected}</li>\n  <li>Item adicional</li>\n</ol>\n`;
    else if (tag === 'quote') insertion = `\n<blockquote>${selected}</blockquote>\n`;
    else if (tag === 'link') insertion = `<a href="https://exemplo.ufrpe.br">${selected}</a>`;
    else if (tag === 'table') {
      insertion = `\n<table class="w-full border my-4">\n  <thead>\n    <tr class="bg-gray-100">\n      <th class="p-2 border">Coluna 1</th>\n      <th class="p-2 border">Coluna 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td class="p-2 border">Dado A</td>\n      <td class="p-2 border">Dado B</td>\n    </tr>\n  </tbody>\n</table>\n`;
    }

    const newContent = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
    setFormData((prev) => ({ ...prev, content: newContent }));
  };

  const handleSave = async (targetStatus: ContentStatus) => {
    setErrorMessage(null);
    setSaveSuccess(false);

    // Validações básicas de formulário
    if (!formData.title.trim()) {
      setErrorMessage('O título da notícia é obrigatório.');
      return;
    }

    if (!formData.slug.trim()) {
      setErrorMessage('O identificador de URL (slug) é obrigatório.');
      return;
    }

    if (!formData.summary.trim()) {
      setErrorMessage('O resumo (lead) da notícia é obrigatório.');
      return;
    }

    if (!formData.content.trim()) {
      setErrorMessage('O conteúdo da notícia não pode ficar vazio.');
      return;
    }

    if (formData.isFeatured && !formData.featuredImage) {
      setErrorMessage('Para destacar a notícia no carrossel, é obrigatório cadastrar uma imagem de capa.');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        status: targetStatus,
        publishedAt: new Date(formData.publishedAt).toISOString(),
      };

      const url = isEditing ? `/api/admin/news/${formData.id}` : '/api/admin/news';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorMsg = await getApiErrorMessage(res, 'Ocorreu um erro ao salvar a notícia.');
        throw new Error(errorMsg);
      }

      setSaveSuccess(true);
      router.refresh();

      setTimeout(() => {
        router.push('/admin/noticias');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao salvar a notícia no servidor.');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Barra de Ações Estilo Drupal no Topo */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4 sticky top-4 z-30">
        <button
          type="button"
          onClick={() => router.push('/admin/noticias')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-ufrpe-blue-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Listagem</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Botão de Pré-visualização antes de publicar */}
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ufrpe-blue-600 transition"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            <span>Pré-visualizar</span>
          </button>

          {/* Botão Salvar como Rascunho */}
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('DRAFT')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-amber-400 bg-amber-50 rounded-lg text-sm font-bold text-amber-900 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-700" />
            <span>Salvar como Rascunho</span>
          </button>

          {/* Botão Publicar */}
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('PUBLISHED')}
            className="inline-flex items-center gap-2 px-5 py-2 bg-ufrpe-green-700 hover:bg-ufrpe-green-800 text-white rounded-lg text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-ufrpe-green-500 transition disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            <span>{isEditing ? 'Atualizar e Publicar' : 'Publicar Notícia'}</span>
          </button>
        </div>
      </div>

      {/* Alertas de Sucesso ou Erro */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          {errorMessage.includes('sessão expirou') && (
            <button
              type="button"
              onClick={() => router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname))}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold whitespace-nowrap self-start sm:self-auto transition"
            >
              Fazer Login Novamente
            </button>
          )}
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
          <span>Notícia salva com sucesso! Redirecionando...</span>
        </div>
      )}

      {/* Formulário Principal em Layout 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna 1 & 2: Campos de Conteúdo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Título da Notícia */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div>
              <label htmlFor="news-title" className="block text-sm font-bold text-gray-800 mb-1">
                Título da Notícia <span className="text-red-500">*</span>
              </label>
              <input
                id="news-title"
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Ex: SOU+UAST promove visita técnica com estudantes do Sertão..."
                className="w-full px-4 py-2.5 text-base sm:text-lg font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-ufrpe-blue-600 focus:border-transparent"
                required
              />
            </div>

            {/* URL Amigável (Slug) */}
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <label htmlFor="news-slug" className="font-semibold text-gray-700">
                  Identificador de URL (Slug) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsSlugManuallyEdited(false);
                    setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
                  }}
                  className="text-ufrpe-blue-700 hover:underline"
                >
                  Regerar do título
                </button>
              </div>
              <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden bg-gray-50 text-xs sm:text-sm text-gray-500">
                <span className="px-3 py-2 bg-gray-100 border-r border-gray-300">/noticias/</span>
                <input
                  id="news-slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setIsSlugManuallyEdited(true);
                    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                  }}
                  className="flex-grow px-3 py-2 bg-white font-mono focus:outline-none text-gray-800"
                />
              </div>
            </div>

            {/* Resumo / Lead da Notícia */}
            <div>
              <label htmlFor="news-summary" className="block text-sm font-bold text-gray-800 mb-1">
                Resumo / Lead da Notícia <span className="text-red-500">*</span>
              </label>
              <textarea
                id="news-summary"
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Breve resumo que será exibido no carrossel, listagens e redes sociais (máximo 2 a 3 frases claras)..."
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-ufrpe-blue-600 focus:border-transparent leading-relaxed"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Caracteres: {formData.summary.length} | Estimativa de leitura: {estimateReadingTime(formData.summary)}
              </p>
            </div>
          </div>

          {/* Editor Rico de Conteúdo */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="news-content-editor" className="block text-sm font-bold text-gray-800">
                Corpo da Matéria (Editor Rico) <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-500">Suporta formatação rica e HTML</span>
            </div>

            {/* Barra de Ferramentas de Formatação Rápida */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-100 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => insertFormatting('b')}
                className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition"
                title="Negrito (Strong)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('i')}
                className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition"
                title="Itálico (Em)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <div className="h-4 w-[1px] bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting('h2')}
                className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition text-xs font-bold"
                title="Subtítulo H2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('h3')}
                className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition text-xs font-bold"
                title="Subtítulo H3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              <div className="h-4 w-[1px] bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting('ul')}
                className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition"
                title="Lista com marcadores"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('ol')}
                className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition"
                title="Lista numerada"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('quote')}
                className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition"
                title="Citação em bloco"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('link')}
                className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition"
                title="Inserir link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('table')}
                className="p-1.5 rounded hover:bg-white text-gray-700 hover:text-black transition"
                title="Inserir tabela formatada"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            <textarea
              id="news-content-editor"
              rows={14}
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Digite o texto da notícia. Utilize parágrafos <p>...</p>, cabeçalhos e listas para organizar as ideias de forma clara..."
              className="w-full px-4 py-3 text-sm font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-ufrpe-blue-600 focus:border-transparent leading-relaxed"
              required
            />
          </div>
        </div>

        {/* Coluna 3: Barra Lateral do Drupal (Mídias, Publicação, Destaque) */}
        <div className="space-y-6">
          {/* Imagem de Capa e Ajuste do Carrossel */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-sm border-b pb-2">
              Imagem de Capa da Notícia
            </h3>
            <FileUploadInput
              label="Capa da Matéria"
              value={formData.featuredImage}
              onChange={(url) => setFormData((prev) => ({ ...prev, featuredImage: url }))}
              aspectRatioHint="16:9 (Ideal para carrossel e redes sociais)"
              maxSizeMb={15}
              helperText="Formatos JPG, PNG ou WebP. Validação automática de tamanho."
            />
          </div>

          {/* Configurações de Publicação e Destaque */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-800 text-sm border-b pb-2">
              Opções de Publicação (Drupal)
            </h3>

            {/* Destaque no Carrossel */}
            <div className="flex items-start gap-3 p-3.5 bg-ufrpe-blue-50 rounded-lg border border-ufrpe-blue-200">
              <input
                id="isFeatured"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-ufrpe-blue-800 focus:ring-ufrpe-blue-700"
              />
              <label htmlFor="isFeatured" className="text-xs text-gray-700 cursor-pointer">
                <span className="font-bold text-ufrpe-blue-900 block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-ufrpe-green-700" />
                  Destacar no Carrossel Principal
                </span>
                O carrossel da home exibe até 3 notícias com esta marcação e imagem de capa. Havendo mais de 3, os 3 mais recentes assumem o topo.
              </label>
            </div>

            {/* Status (Rascunho ou Publicado) */}
            <div>
              <label htmlFor="status" className="block text-xs font-bold text-gray-700 mb-1">
                Status do Conteúdo
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as ContentStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-ufrpe-blue-600 font-semibold"
              >
                <option value="PUBLISHED">Publicado (Visível ao público)</option>
                <option value="DRAFT">Rascunho (Salvo apenas para editores)</option>
              </select>
            </div>

            {/* Data e Hora de Publicação */}
            <div>
              <label htmlFor="publishedAt" className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                Data e Hora de Publicação
              </label>
              <input
                id="publishedAt"
                type="datetime-local"
                value={formData.publishedAt}
                onChange={(e) => setFormData((prev) => ({ ...prev, publishedAt: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-ufrpe-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pré-Visualização Estilo Drupal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Pré-visualização da notícia"
        >
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Header da Pré-visualização */}
            <div className="bg-ufrpe-blue-900 text-white p-4 sticky top-0 flex items-center justify-between z-10 border-b border-ufrpe-blue-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-yellow-300" />
                <span className="font-bold text-base">Modo de Pré-visualização (Como o público verá)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-full hover:bg-ufrpe-blue-800 text-slate-300 hover:text-white"
                aria-label="Fechar pré-visualização"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo Idêntico à Página de Detalhe da Notícia */}
            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="bg-ufrpe-green-100 text-ufrpe-green-800 font-bold px-2.5 py-1 rounded-full">
                  {formData.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                </span>
                <span>{formatDate(formData.publishedAt)}</span>
                <span>•</span>
                <span>{estimateReadingTime(formData.content)}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-ufrpe-blue-900 leading-tight">
                {formData.title || 'Título da Notícia'}
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed font-medium border-l-4 border-ufrpe-green-600 pl-4">
                {formData.summary || 'Resumo da notícia...'}
              </p>

              {formData.featuredImage && (
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-gray-100 shadow-md">
                  <Image
                    src={formData.featuredImage}
                    alt={formData.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div
                className="prose max-w-none prose-headings:text-ufrpe-blue-900 prose-a:text-ufrpe-blue-800 pt-4"
                dangerouslySetInnerHTML={{ __html: formData.content || '<p>Nenhum conteúdo inserido.</p>' }}
              />
            </div>

            <div className="bg-gray-50 p-4 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm rounded-lg"
              >
                Fechar Pré-visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
