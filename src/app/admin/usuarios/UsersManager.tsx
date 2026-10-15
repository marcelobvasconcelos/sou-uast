'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Shield,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  KeyRound,
  Loader2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Role } from '@prisma/client';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  _count?: { news: number };
}

export default function UsersManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: UserItem[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<UserItem> & { password?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setError(null);
    setEditingUser({
      name: '',
      email: '',
      password: '',
      role: 'EDITOR',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setError(null);
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError(null);

    const isNew = !editingUser.id;
    if (isNew && !editingUser.password) {
      setError('A senha é obrigatória para novos usuários.');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isNew ? '/api/admin/users' : `/api/admin/users/${editingUser.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar usuário.');
      }

      setModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Falha ao processar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: UserItem) => {
    if (user.id === currentUserId) {
      alert('Você não pode excluir sua própria conta conectada.');
      return;
    }

    if (!confirm(`Deseja realmente remover o usuário "${user.name}" (${user.email})?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao excluir usuário.');
      }
    } catch {
      alert('Falha na comunicação.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ufrpe-green-700 hover:bg-ufrpe-green-800 text-white rounded-lg text-sm font-bold shadow transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-gray-700 border-b">
              <tr>
                <th className="p-4">Nome / E-mail</th>
                <th className="p-4">Papel (Role)</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Matérias</th>
                <th className="p-4">Cadastro</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {u.role === 'ADMIN' ? 'Administrador' : 'Editor de Conteúdo'}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold">
                        <XCircle className="w-3.5 h-3.5" />
                        Inativo
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center text-xs font-semibold">
                    {u._count?.news || 0}
                  </td>

                  <td className="p-4 text-xs whitespace-nowrap">
                    {formatDate(u.createdAt)}
                  </td>

                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 text-gray-600 hover:text-ufrpe-blue-800 rounded hover:bg-slate-100"
                        title="Editar usuário"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {u.id !== currentUserId && (
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                          title="Excluir usuário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação / Edição de Usuário */}
      {modalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">
              {editingUser.id ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">E-mail Institucional</label>
                <input
                  type="email"
                  required
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {editingUser.id ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso'}
                </label>
                <input
                  type="password"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder={editingUser.id ? '••••••••' : 'Mínimo 8 caracteres'}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Papel / Função</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="EDITOR">Editor (Apenas Conteúdo)</option>
                    <option value="ADMIN">Administrador (Total)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Status da Conta</label>
                  <select
                    value={editingUser.isActive ? '1' : '0'}
                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.value === '1' })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="1">Ativo</option>
                    <option value="0">Inativo (Bloqueado)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-ufrpe-green-700 hover:bg-ufrpe-green-800 text-white rounded-lg text-xs font-bold"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
