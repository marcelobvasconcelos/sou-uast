'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderPlus,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Layers,
  Link as LinkIcon,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { CategoryWithItems, MenuItemData } from '@/types';
import { getApiErrorMessage } from '@/lib/api-errors';

interface MenuManagerProps {
  initialCategories: CategoryWithItems[];
  availablePages: Array<{ id: string; title: string; slug: string }>;
}

export default function MenuManager({ initialCategories, availablePages }: MenuManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithItems[]>(initialCategories);

  // Estados para modais e formulários
  const [editingCategory, setEditingCategory] = useState<{ id?: string; name: string } | null>(null);
  const [editingItem, setEditingItem] = useState<{
    id?: string;
    title: string;
    categoryId: string;
    parentId?: string | null;
    pageId?: string | null;
    url?: string | null;
    openInNewTab: boolean;
    isActive: boolean;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // 1. Salvar ou Criar Categoria
  const handleSaveCategory = async () => {
    if (!editingCategory?.name.trim()) return;
    setIsLoading(true);

    try {
      const isNew = !editingCategory.id;
      const url = '/api/admin/menu/categories';
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });

      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, 'Erro ao salvar categoria.'));
      }

      setEditingCategory(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Falha ao processar categoria.');
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir Categoria
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir a categoria "${name}" e todos os seus itens associados?`)) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/menu/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, 'Erro ao excluir categoria.'));
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Falha ao excluir categoria.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Salvar ou Criar Item de Menu
  const handleSaveItem = async () => {
    if (!editingItem?.title.trim()) return;
    setIsLoading(true);

    try {
      const isNew = !editingItem.id;
      const url = '/api/admin/menu/items';
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, 'Erro ao salvar item de menu.'));
      }

      setEditingItem(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Falha ao salvar item de menu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir Item de Menu
  const handleDeleteItem = async (id: string, title: string) => {
    if (!confirm(`Deseja excluir o item de menu "${title}"?`)) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/menu/items?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, 'Erro ao excluir item de menu.'));
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Falha ao excluir item de menu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Alternar Ativação
  const toggleItemActive = async (item: MenuItemData) => {
    try {
      const res = await fetch('/api/admin/menu/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          isActive: !item.isActive,
        }),
      });
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, 'Erro ao alternar status do item.'));
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Falha ao alternar visibilidade.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ufrpe-blue-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-ufrpe-green-700" />
            <span>Gerenciador de Categorias e Menu em Cascata</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Organize a hierarquia do menu lateral institucional exibido em todas as páginas internas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditingCategory({ name: '' })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ufrpe-blue-800 hover:bg-ufrpe-blue-900 text-white rounded-lg text-sm font-bold shadow-sm transition"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Lista de Categorias e Seus Itens */}
      <div className="space-y-6">
        {categories.map((category) => {
          const rootItems = category.menuItems.filter((i) => !i.parentId);

          return (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Barra da Categoria */}
              <div className="bg-slate-100 p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm uppercase tracking-wider text-ufrpe-blue-900">
                    {category.name}
                  </span>
                  <span className="text-xs bg-gray-200 text-gray-700 font-semibold px-2 py-0.5 rounded-full">
                    {category.menuItems.length} itens
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingItem({
                        title: '',
                        categoryId: category.id,
                        parentId: null,
                        pageId: availablePages[0]?.id || null,
                        url: '',
                        openInNewTab: false,
                        isActive: true,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ufrpe-green-700 hover:bg-ufrpe-green-800 text-white rounded-md text-xs font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Item</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCategory({ id: category.id, name: category.name })}
                    className="p-1.5 text-gray-600 hover:text-ufrpe-blue-800 hover:bg-white rounded"
                    title="Renomear Categoria"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Excluir Categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Itens da Categoria */}
              <div className="p-4">
                {rootItems.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    Nenhum item cadastrado nesta categoria. Clique em "Adicionar Item" acima.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {rootItems.map((item) => (
                      <li key={item.id} className="space-y-2">
                        {/* Linha do Item Raiz */}
                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-slate-50 transition">
                          <div className="flex items-center gap-2.5 truncate">
                            <button
                              type="button"
                              onClick={() => toggleItemActive(item)}
                              className={`p-1 rounded ${
                                item.isActive ? 'text-ufrpe-green-700' : 'text-gray-400'
                              }`}
                              title={item.isActive ? 'Ativo (clique para ocultar)' : 'Inativo (clique para exibir)'}
                            >
                              {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <span className="font-semibold text-sm text-gray-800">{item.title}</span>
                            {item.pageSlug && (
                              <span className="text-xs text-ufrpe-blue-800 bg-ufrpe-blue-50 px-2 py-0.5 rounded">
                                Página: /{item.pageSlug}
                              </span>
                            )}
                            {item.url && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" />
                                {item.url}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Botão de adicionar subitem em cascata */}
                            <button
                              type="button"
                              onClick={() =>
                                setEditingItem({
                                  title: '',
                                  categoryId: category.id,
                                  parentId: item.id,
                                  pageId: availablePages[0]?.id || null,
                                  url: '',
                                  openInNewTab: false,
                                  isActive: true,
                                })
                              }
                              className="text-xs font-semibold text-ufrpe-blue-700 hover:underline px-2 py-1"
                              title="Criar submenu filho deste item"
                            >
                              + Subitem
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingItem({
                                  id: item.id,
                                  title: item.title,
                                  categoryId: category.id,
                                  parentId: item.parentId,
                                  pageId: item.pageId,
                                  url: item.url,
                                  openInNewTab: item.openInNewTab,
                                  isActive: item.isActive,
                                })
                              }
                              className="p-1.5 text-gray-500 hover:text-ufrpe-blue-800 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id, item.title)}
                              className="p-1.5 text-red-500 hover:text-red-700 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Subitens Filhos (Cascata) */}
                        {item.children && item.children.length > 0 && (
                          <ul className="pl-6 space-y-1.5 border-l-2 border-ufrpe-blue-200 ml-4">
                            {item.children.map((sub) => (
                              <li
                                key={sub.id}
                                className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-gray-200 text-xs"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="font-semibold text-gray-700">↳ {sub.title}</span>
                                  {sub.pageSlug && (
                                    <span className="text-ufrpe-blue-700 bg-white px-1.5 py-0.5 rounded border">
                                      /{sub.pageSlug}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingItem({
                                        id: sub.id,
                                        title: sub.title,
                                        categoryId: category.id,
                                        parentId: sub.parentId,
                                        pageId: sub.pageId,
                                        url: sub.url,
                                        openInNewTab: sub.openInNewTab,
                                        isActive: sub.isActive,
                                      })
                                    }
                                    className="p-1 text-gray-500 hover:text-ufrpe-blue-800"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(sub.id, sub.title)}
                                    className="p-1 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Categoria (Criar/Editar) */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">
              {editingCategory.id ? 'Renomear Categoria' : 'Nova Categoria de Menu'}
            </h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nome da Categoria</label>
              <input
                type="text"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                placeholder="Ex: Cursos e Oportunidades"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-ufrpe-blue-600"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-ufrpe-blue-800 text-white rounded-lg text-xs font-bold hover:bg-ufrpe-blue-900"
              >
                Salvar Categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Item de Menu (Criar/Editar) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">
              {editingItem.id ? 'Editar Item de Menu' : 'Novo Item de Menu'}
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Rótulo / Título do Link</label>
              <input
                type="text"
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                placeholder="Ex: Visitas Guiadas aos Laboratórios"
                className="w-full px-3 py-2 border rounded-lg text-sm font-semibold"
              />
            </div>

            {/* Selecionar Página Dinâmica ou Link Manual */}
            <div className="space-y-3 p-3 bg-slate-50 rounded-lg border">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Vincular a uma Página Institucional Dinâmica
                </label>
                <select
                  value={editingItem.pageId || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      pageId: e.target.value || null,
                      url: e.target.value ? '' : editingItem.url,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">-- Selecionar página existente --</option>
                  {availablePages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.title} (/pagina/{page.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ou URL Personalizada / Link Externo
                </label>
                <input
                  type="text"
                  value={editingItem.url || ''}
                  disabled={Boolean(editingItem.pageId)}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  placeholder="Ex: /noticias ou https://uast.ufrpe.br"
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="modalOpenNewTab"
                type="checkbox"
                checked={editingItem.openInNewTab}
                onChange={(e) => setEditingItem({ ...editingItem, openInNewTab: e.target.checked })}
                className="rounded text-ufrpe-blue-800"
              />
              <label htmlFor="modalOpenNewTab" className="text-xs text-gray-700 cursor-pointer">
                Abrir link em nova aba (target="_blank")
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleSaveItem}
                className="px-4 py-2 bg-ufrpe-green-700 text-white rounded-lg text-xs font-bold hover:bg-ufrpe-green-800"
              >
                Salvar Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
