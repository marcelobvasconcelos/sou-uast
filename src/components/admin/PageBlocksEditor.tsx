'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Type,
  Image as ImageIcon,
  Video,
  Grid,
  Code2,
  Save,
  Eye,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
  ArrowLeft
} from 'lucide-react';
import { BlockType, ContentStatus } from '@prisma/client';
import { PageBlockData } from '@/types';
import FileUploadInput from './FileUploadInput';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { slugify } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api-errors';
import { getApiUrl } from '@/lib/api-client';

interface PageBlocksEditorProps {
  pageId?: string;
  initialTitle?: string;
  initialSlug?: string;
  initialSubtitle?: string;
  initialBannerImage?: string | null;
  initialStatus?: ContentStatus;
  initialBlocks?: PageBlockData[];
  isEditing?: boolean;
}

export default function PageBlocksEditor({
  pageId,
  initialTitle = '',
  initialSlug = '',
  initialSubtitle = '',
  initialBannerImage = '',
  initialStatus = 'PUBLISHED',
  initialBlocks = [],
  isEditing = false,
}: PageBlocksEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [bannerImage, setBannerImage] = useState<string>(initialBannerImage || '');
  const [status, setStatus] = useState<ContentStatus>(initialStatus);
  const [blocks, setBlocks] = useState<PageBlockData[]>(() => {
    return initialBlocks.length > 0
      ? initialBlocks.sort((a, b) => a.order - b.order)
      : [
          {
            type: 'RICH_TEXT',
            order: 0,
            content: '<h2>Título da Seção</h2><p>Digite as informações desta página institucional...</p>',
            settings: JSON.stringify({ alignment: 'left', style: 'default' }),
          },
        ];
  });

  const [isSlugAuto, setIsSlugAuto] = useState(!initialSlug);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (isSlugAuto) {
      setSlug(slugify(val));
    }
  };

  // Reordenação de blocos
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Reatribuir números de ordem sequenciais
    const reordered = updated.map((b, idx) => ({ ...b, order: idx }));
    setBlocks(reordered);
  };

  // Duplicar bloco
  const duplicateBlock = (index: number) => {
    const target = blocks[index];
    const duplicated: PageBlockData = {
      ...target,
      id: undefined, // Novo ID ao salvar
      order: index + 1,
    };

    const updated = [...blocks];
    updated.splice(index + 1, 0, duplicated);

    const reordered = updated.map((b, idx) => ({ ...b, order: idx }));
    setBlocks(reordered);
  };

  // Remover bloco
  const removeBlock = (index: number) => {
    if (blocks.length === 1) {
      alert('A página precisa ter pelo menos um bloco de conteúdo.');
      return;
    }
    const updated = blocks.filter((_, idx) => idx !== index);
    const reordered = updated.map((b, idx) => ({ ...b, order: idx }));
    setBlocks(reordered);
  };

  // Adicionar novo bloco
  const addBlock = (type: BlockType) => {
    let initialContent = '';
    let initialSettings = '{}';

    if (type === 'RICH_TEXT') {
      initialContent = '<p>Novo parágrafo de texto formatado.</p>';
      initialSettings = JSON.stringify({ alignment: 'left', style: 'default' });
    } else if (type === 'IMAGE') {
      initialContent = JSON.stringify({ url: '', alt: 'Imagem ilustrativa', caption: '', linkUrl: '' });
      initialSettings = JSON.stringify({ width: 'full' });
    } else if (type === 'VIDEO') {
      initialContent = JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: '', caption: '' });
    } else if (type === 'GALLERY') {
      initialContent = JSON.stringify({ images: [], columns: 3 });
      initialSettings = JSON.stringify({ columns: 3 });
    } else if (type === 'HTML') {
      initialContent = '<div class="p-4 bg-gray-50 border rounded">\n  <p>Conteúdo HTML personalizado</p>\n</div>';
    }

    const newBlock: PageBlockData = {
      type,
      order: blocks.length,
      content: initialContent,
      settings: initialSettings,
    };

    setBlocks([...blocks, newBlock]);
  };

  // Atualizar dados de um bloco específico
  const updateBlockContent = (index: number, newContent: string) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], content: newContent };
    setBlocks(updated);
  };

  const updateBlockSettings = (index: number, newSettings: string) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], settings: newSettings };
    setBlocks(updated);
  };

  // Salvar no backend
  const handleSave = async (targetStatus: ContentStatus) => {
    setErrorMessage(null);
    setSaveSuccess(false);

    if (!title.trim()) {
      setErrorMessage('O título da página é obrigatório.');
      return;
    }

    if (!slug.trim()) {
      setErrorMessage('O identificador de URL (slug) é obrigatório.');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title,
        slug,
        subtitle,
        bannerImage,
        status: targetStatus,
        blocks,
      };

      const url = getApiUrl(isEditing ? `/api/admin/pages/${pageId}` : '/api/admin/pages');
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorMsg = await getApiErrorMessage(res, 'Erro ao salvar página institucional.');
        throw new Error(errorMsg);
      }

      setSaveSuccess(true);
      router.refresh();

      setTimeout(() => {
        router.push('/admin/paginas');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao salvar página.');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Barra de Ações Superior */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4 sticky top-4 z-30">
        <button
          type="button"
          onClick={() => router.push('/admin/paginas')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-ufrpe-blue-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Páginas</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            <span>Pré-visualizar</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('DRAFT')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-amber-400 bg-amber-50 rounded-lg text-sm font-bold text-amber-900 hover:bg-amber-100 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-700" />
            <span>Salvar Rascunho</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('PUBLISHED')}
            className="inline-flex items-center gap-2 px-5 py-2 bg-ufrpe-green-700 hover:bg-ufrpe-green-800 text-white rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            <span>{isEditing ? 'Atualizar Página' : 'Publicar Página'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
          <span>Página salva com sucesso! Redirecionando...</span>
        </div>
      )}

      {/* Metadados da Página (Modelo Padrão) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-ufrpe-blue-900 border-b pb-2">
          1. Informações Básicas da Página
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="page-title" className="block text-xs font-bold text-gray-700 mb-1">
              Título da Página <span className="text-red-500">*</span>
            </label>
            <input
              id="page-title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Ex: Como Ingressar na UAST"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-ufrpe-blue-600"
              required
            />
          </div>

          <div>
            <label htmlFor="page-slug" className="block text-xs font-bold text-gray-700 mb-1">
              Slug da URL (/pagina/{slug || '...'})
            </label>
            <input
              id="page-slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setIsSlugAuto(false);
                setSlug(slugify(e.target.value));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-ufrpe-blue-600"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="page-subtitle" className="block text-xs font-bold text-gray-700 mb-1">
            Subtítulo Opcional
          </label>
          <input
            id="page-subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Ex: Informações sobre vagas pelo SiSU e documentação para cotas"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ufrpe-blue-600"
          />
        </div>

        <div>
          <FileUploadInput
            label="Banner Superior Opcional da Página"
            value={bannerImage}
            onChange={(url) => setBannerImage(url)}
            aspectRatioHint="21:9 ou 16:9 Panorâmico"
            helperText="Banner ilustrativo exibido no topo da página."
          />
        </div>
      </div>

      {/* Pilha de Blocos Ordenáveis (Item 7 e 8 dos Requisitos) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ufrpe-blue-900">
            2. Pilha de Blocos de Conteúdo ({blocks.length})
          </h2>
          <span className="text-xs text-gray-500">
            Reordene, duplique ou exclua os blocos livremente
          </span>
        </div>

        {blocks.map((block, idx) => {
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden"
            >
              {/* Barra de Título do Bloco */}
              <div className="bg-slate-100 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-ufrpe-blue-800 text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-700">
                    {block.type === 'RICH_TEXT' && 'Texto Rico'}
                    {block.type === 'IMAGE' && 'Imagem com Legenda'}
                    {block.type === 'VIDEO' && 'Vídeo (YouTube/Vimeo/Upload)'}
                    {block.type === 'GALLERY' && 'Galeria de Fotos'}
                    {block.type === 'HTML' && 'Código HTML Livre (Sanitizado)'}
                  </span>
                </div>

                {/* Controles de Ação do Bloco */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveBlock(idx, 'up')}
                    className="p-1 text-gray-500 hover:text-ufrpe-blue-800 hover:bg-white rounded disabled:opacity-30"
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === blocks.length - 1}
                    onClick={() => moveBlock(idx, 'down')}
                    className="p-1 text-gray-500 hover:text-ufrpe-blue-800 hover:bg-white rounded disabled:opacity-30"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateBlock(idx)}
                    className="p-1 text-gray-500 hover:text-ufrpe-blue-800 hover:bg-white rounded"
                    title="Duplicar este bloco"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(idx)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Remover este bloco"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Corpo de Edição de Acordo com o Tipo */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* 1. TEXTO RICO */}
                {block.type === 'RICH_TEXT' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-gray-700">Estilo da Caixa:</span>
                      <select
                        value={(() => {
                          try {
                            return JSON.parse(block.settings || '{}').style || 'default';
                          } catch {
                            return 'default';
                          }
                        })()}
                        onChange={(e) => {
                          const current = (() => {
                            try {
                              return JSON.parse(block.settings || '{}');
                            } catch {
                              return {};
                            }
                          })();
                          updateBlockSettings(idx, JSON.stringify({ ...current, style: e.target.value }));
                        }}
                        className="px-2 py-1 border rounded bg-white"
                      >
                        <option value="default">Padrão</option>
                        <option value="callout">Destaque Azul Institucional</option>
                        <option value="highlight">Destaque Amarelo / Alerta</option>
                        <option value="quote">Citação / Aspas Verdes</option>
                      </select>
                    </div>
                    <textarea
                      rows={6}
                      value={block.content}
                      onChange={(e) => updateBlockContent(idx, e.target.value)}
                      placeholder="Digite o texto formatado (suporta tags HTML básicas: <h2>, <p>, <strong>, <ul>, <li>)..."
                      className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                    />
                  </div>
                )}

                {/* 2. IMAGEM */}
                {block.type === 'IMAGE' && (
                  <div className="space-y-3">
                    {(() => {
                      let imgData = { url: '', alt: '', caption: '', linkUrl: '' };
                      try {
                        if (block.content.startsWith('{')) imgData = { ...imgData, ...JSON.parse(block.content) };
                        else imgData.url = block.content;
                      } catch {
                        imgData.url = block.content;
                      }

                      const updateImg = (field: string, val: string) => {
                        const updated = { ...imgData, [field]: val };
                        updateBlockContent(idx, JSON.stringify(updated));
                      };

                      return (
                        <div className="space-y-3">
                          <FileUploadInput
                            label="Arquivo da Imagem"
                            value={imgData.url}
                            onChange={(url) => updateImg('url', url)}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Texto Alternativo Acessível (Alt)
                              </label>
                              <input
                                type="text"
                                value={imgData.alt}
                                onChange={(e) => updateImg('alt', e.target.value)}
                                placeholder="Descrição clara para leitores de tela..."
                                className="w-full px-3 py-1.5 border rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Legenda Exibida Abaixo da Imagem
                              </label>
                              <input
                                type="text"
                                value={imgData.caption}
                                onChange={(e) => updateImg('caption', e.target.value)}
                                placeholder="Ex: Laboratório de Solos da UAST..."
                                className="w-full px-3 py-1.5 border rounded text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 3. VÍDEO */}
                {block.type === 'VIDEO' && (
                  <div className="space-y-3">
                    {(() => {
                      let videoData = { url: '', title: '', caption: '' };
                      try {
                        if (block.content.startsWith('{')) videoData = { ...videoData, ...JSON.parse(block.content) };
                        else videoData.url = block.content;
                      } catch {
                        videoData.url = block.content;
                      }

                      const updateVid = (field: string, val: string) => {
                        const updated = { ...videoData, [field]: val };
                        updateBlockContent(idx, JSON.stringify(updated));
                      };

                      return (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              URL do Vídeo (YouTube, Vimeo ou link de vídeo MP4)
                            </label>
                            <input
                              type="text"
                              value={videoData.url}
                              onChange={(e) => updateVid('url', e.target.value)}
                              placeholder="Ex: https://www.youtube.com/watch?v=..."
                              className="w-full px-3 py-2 border rounded text-sm font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Título do Vídeo
                              </label>
                              <input
                                type="text"
                                value={videoData.title}
                                onChange={(e) => updateVid('title', e.target.value)}
                                placeholder="Ex: Apresentação dos Cursos da UAST"
                                className="w-full px-3 py-1.5 border rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Legenda Opcional
                              </label>
                              <input
                                type="text"
                                value={videoData.caption}
                                onChange={(e) => updateVid('caption', e.target.value)}
                                placeholder="Ex: Produção da Assessoria de Comunicação..."
                                className="w-full px-3 py-1.5 border rounded text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 4. GALERIA */}
                {block.type === 'GALLERY' && (
                  <div className="space-y-3">
                    {(() => {
                      let galData = { images: [] as Array<{ url: string; alt: string; caption: string }>, columns: 3 };
                      try {
                        if (block.content.startsWith('{')) galData = { ...galData, ...JSON.parse(block.content) };
                      } catch {}

                      return (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500">
                            Adicione imagens à galeria. O usuário poderá clicar em qualquer imagem para ampliá-la.
                          </p>
                          <FileUploadInput
                            label="Adicionar Nova Imagem à Galeria"
                            value=""
                            onChange={(newUrl) => {
                              if (newUrl) {
                                const newImages = [...galData.images, { url: newUrl, alt: 'Foto da galeria', caption: '' }];
                                updateBlockContent(idx, JSON.stringify({ ...galData, images: newImages }));
                              }
                            }}
                          />
                          {galData.images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                              {galData.images.map((img, imgIdx) => (
                                <div key={imgIdx} className="relative aspect-video rounded border overflow-hidden group">
                                  <img src={getApiUrl(img.url)} alt="" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const filtered = galData.images.filter((_, i) => i !== imgIdx);
                                      updateBlockContent(idx, JSON.stringify({ ...galData, images: filtered }));
                                    }}
                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs"
                                    title="Remover"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 5. HTML LIVRE */}
                {block.type === 'HTML' && (
                  <div className="space-y-2">
                    <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-800">
                      <strong>Nota de Segurança:</strong> Aceita código HTML colado (tabelas personalizadas, widgets, iframes do Google Maps, Google Forms ou YouTube). Scripts maliciosos são removidos automaticamente e iframes são validados contra a lista branca do sistema.
                    </div>
                    <textarea
                      rows={6}
                      value={block.content}
                      onChange={(e) => updateBlockContent(idx, e.target.value)}
                      placeholder="Cole aqui seu código HTML ou <iframe>..."
                      className="w-full px-3 py-2 border rounded-lg font-mono text-xs text-gray-800"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Botões para Adicionar Novos Blocos */}
        <div className="p-4 bg-slate-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Adicionar Novo Bloco de Conteúdo:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => addBlock('RICH_TEXT')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-ufrpe-blue-50 text-gray-800 hover:text-ufrpe-blue-800 rounded-lg border text-xs font-bold shadow-sm transition"
            >
              <Type className="w-4 h-4 text-ufrpe-blue-700" />
              <span>Texto Rico</span>
            </button>
            <button
              type="button"
              onClick={() => addBlock('IMAGE')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-ufrpe-blue-50 text-gray-800 hover:text-ufrpe-blue-800 rounded-lg border text-xs font-bold shadow-sm transition"
            >
              <ImageIcon className="w-4 h-4 text-ufrpe-green-700" />
              <span>Imagem</span>
            </button>
            <button
              type="button"
              onClick={() => addBlock('VIDEO')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-ufrpe-blue-50 text-gray-800 hover:text-ufrpe-blue-800 rounded-lg border text-xs font-bold shadow-sm transition"
            >
              <Video className="w-4 h-4 text-red-600" />
              <span>Vídeo</span>
            </button>
            <button
              type="button"
              onClick={() => addBlock('GALLERY')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-ufrpe-blue-50 text-gray-800 hover:text-ufrpe-blue-800 rounded-lg border text-xs font-bold shadow-sm transition"
            >
              <Grid className="w-4 h-4 text-purple-600" />
              <span>Galeria de Fotos</span>
            </button>
            <button
              type="button"
              onClick={() => addBlock('HTML')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-ufrpe-blue-50 text-gray-800 hover:text-ufrpe-blue-800 rounded-lg border text-xs font-bold shadow-sm transition"
            >
              <Code2 className="w-4 h-4 text-amber-600" />
              <span>HTML / iFrame</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Pré-Visualização */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border">
            <div className="bg-ufrpe-blue-900 text-white p-4 sticky top-0 flex items-center justify-between z-10">
              <span className="font-bold">Pré-visualização da Página Dinâmica</span>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-1 rounded-full text-white hover:bg-ufrpe-blue-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <h1 className="text-3xl font-extrabold text-ufrpe-blue-900">{title || 'Título da Página'}</h1>
              {subtitle && <p className="text-lg text-gray-600 italic">{subtitle}</p>}
              {bannerImage && (
                <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden bg-gray-100">
                  <img src={getApiUrl(bannerImage)} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <BlockRenderer blocks={blocks} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
