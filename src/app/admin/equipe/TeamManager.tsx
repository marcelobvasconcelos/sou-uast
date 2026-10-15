'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  Award,
  HelpCircle,
  Eye,
  Camera
} from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';
import { TeamMemberData } from '@/types';
import { getApiErrorMessage } from '@/lib/api-errors';
import { getApiUrl } from '@/lib/api-client';

interface TeamManagerProps {
  initialMembers: TeamMemberData[];
  currentUserRole?: string;
}

function getInitials(name: string): string {
  if (!name) return 'UAST';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PRESET_PROJECT_ROLES = ['Coordenador', 'Membro', 'Monitor'];

export default function TeamManager({
  initialMembers,
  currentUserRole = 'EDITOR',
}: TeamManagerProps) {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMemberData[]>(initialMembers);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<TeamMemberData> | null>(null);
  const [selectedRolePreset, setSelectedRolePreset] = useState<string>('Membro');
  const [customRoleInput, setCustomRoleInput] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleOpenCreate = () => {
    setErrorMessage(null);
    setSelectedRolePreset('Membro');
    setCustomRoleInput('');
    setEditingMember({
      name: '',
      degree: '',
      role: '',
      projectRole: 'Membro',
      photoUrl: '',
      order: members.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (member: TeamMemberData) => {
    setErrorMessage(null);
    const isPreset = PRESET_PROJECT_ROLES.includes(member.projectRole);
    if (isPreset) {
      setSelectedRolePreset(member.projectRole);
      setCustomRoleInput('');
    } else {
      setSelectedRolePreset('OUTRO');
      setCustomRoleInput(member.projectRole);
    }

    setEditingMember({
      id: member.id,
      name: member.name,
      degree: member.degree,
      role: member.role,
      projectRole: member.projectRole,
      photoUrl: member.photoUrl || '',
      order: member.order,
      isActive: member.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setErrorMessage(null);

    // Resolver papel no projeto
    const finalProjectRole =
      selectedRolePreset === 'OUTRO' ? customRoleInput.trim() : selectedRolePreset;

    if (!editingMember.name?.trim()) {
      setErrorMessage('O nome completo é obrigatório.');
      return;
    }
    if (!editingMember.degree?.trim()) {
      setErrorMessage('A titulação é obrigatória (ex: Graduando, Mestre, Doutor).');
      return;
    }
    if (!editingMember.role?.trim()) {
      setErrorMessage('O cargo é obrigatório (ex: Professor Adjunto, Bolsista).');
      return;
    }
    if (!finalProjectRole) {
      setErrorMessage('A participação no projeto é obrigatória.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...editingMember,
        projectRole: finalProjectRole,
      };

      const isNew = !editingMember.id;
      const res = await fetch(getApiUrl('/api/admin/team'), {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, 'Erro ao salvar membro da equipe.'));
      }

      setModalOpen(false);
      showNotification(isNew ? 'Membro adicionado com sucesso!' : 'Membro atualizado com sucesso!');
      router.refresh();

      // Recarregar lista local
      const listRes = await fetch(getApiUrl('/api/admin/team'));
      const listData = await listRes.json();
      if (listData.members) {
        setMembers(listData.members);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao salvar membro da equipe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (member: TeamMemberData) => {
    if (!confirm(`Tem certeza que deseja remover ${member.name} da equipe?`)) {
      return;
    }

    try {
      const res = await fetch(getApiUrl(`/api/admin/team?id=${member.id}`), {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, 'Erro ao remover membro.'));
      }

      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      showNotification('Membro removido da equipe.');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Falha ao remover membro.');
    }
  };

  const handleToggleActive = async (member: TeamMemberData) => {
    try {
      const updatedActive = !member.isActive;
      const res = await fetch(getApiUrl('/api/admin/team'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member.id, isActive: updatedActive }),
      });
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, 'Erro ao alternar status.'));
      }

      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, isActive: updatedActive } : m))
      );
      showNotification(`Status de ${member.name} alterado para ${updatedActive ? 'Ativo' : 'Inativo'}.`);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Falha ao alterar status.');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    setIsReordering(true);
    const newMembers = [...members];
    const temp = newMembers[index];
    newMembers[index] = newMembers[targetIndex];
    newMembers[targetIndex] = temp;

    // Atualizar order em lote
    const reorderPayload = newMembers.map((m, idx) => ({
      id: m.id,
      order: idx + 1,
    }));

    try {
      const res = await fetch(getApiUrl('/api/admin/team'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: reorderPayload }),
      });
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, 'Erro ao atualizar ordem.'));
      }

      setMembers(
        newMembers.map((m, idx) => ({
          ...m,
          order: idx + 1,
        }))
      );
      showNotification('Ordem dos membros atualizada com sucesso.');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Falha ao reordenar membros.');
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notificação de Sucesso */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Barra de Ações Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-ufrpe-blue-50 text-ufrpe-blue-800 rounded-xl">
            <Users className="w-6 h-6 text-ufrpe-blue-800" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Integrantes da Equipe ({members.length})
            </h2>
            <p className="text-xs text-gray-500">
              Membros cadastrados com fotos circulares e ordenação personalizada.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ufrpe-green-700 hover:bg-ufrpe-green-800 text-white text-sm font-bold rounded-xl shadow-sm transition active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Membro</span>
        </button>
      </div>

      {/* Dica sobre recorte circular */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <strong>Padronização Visual Circular:</strong> As fotos são renderizadas automaticamente em formato circular uniforme (recorte centralizado) tanto na grade pública quanto no painel. Caso o membro não possua foto, o sistema exibe automaticamente um círculo elegante com as iniciais do seu nome.
        </div>
      </div>

      {/* Lista / Tabela de Membros */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {members.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">Nenhum membro cadastrado</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              Clique no botão "Novo Membro" acima para cadastrar os integrantes do projeto SOU+UAST.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ufrpe-blue-800 text-white text-xs font-bold rounded-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Primeiro Membro</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {members.map((member, index) => {
              const isCoord = (member.projectRole || '').toLowerCase().includes('coordena');
              return (
                <div
                  key={member.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/80 ${
                    !member.isActive ? 'opacity-60 bg-gray-50/60' : ''
                  }`}
                >
                  {/* Foto Circular e Dados do Membro */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Foto Circular Perfeita (Uniforme com o Site) */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-ufrpe-blue-200 flex-shrink-0 bg-slate-100 shadow-sm flex items-center justify-center">
                      {member.photoUrl ? (
                        <Image
                          src={member.photoUrl}
                          alt={member.name}
                          fill
                          sizes="64px"
                          className="object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-ufrpe-blue-900 text-white font-black text-sm select-none">
                          {getInitials(member.name)}
                        </div>
                      )}
                      {isCoord && (
                        <div className="absolute bottom-0 right-0 bg-amber-500 text-white p-0.5 rounded-full border border-white">
                          <Award className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Textos */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-gray-900 truncate">
                          {member.name}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            isCoord
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-ufrpe-blue-50 text-ufrpe-blue-800 border-ufrpe-blue-200'
                          }`}
                        >
                          {member.projectRole}
                        </span>
                        {!member.isActive && (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-gray-200 text-gray-700 rounded-full">
                            Inativo
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-ufrpe-blue-800 mt-0.5 truncate">
                        {member.degree}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {/* Controles de Ordem e Ações */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                    {/* Botões de Reordenação */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-gray-200">
                      <button
                        type="button"
                        disabled={index === 0 || isReordering}
                        onClick={() => handleMoveOrder(index, 'up')}
                        title="Mover para cima"
                        className="p-1 hover:bg-white text-gray-600 hover:text-ufrpe-blue-900 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-mono font-bold text-gray-600 px-1">
                        #{member.order}
                      </span>
                      <button
                        type="button"
                        disabled={index === members.length - 1 || isReordering}
                        onClick={() => handleMoveOrder(index, 'down')}
                        title="Mover para baixo"
                        className="p-1 hover:bg-white text-gray-600 hover:text-ufrpe-blue-900 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Toggle Ativo / Inativo */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(member)}
                      title={member.isActive ? 'Desativar exibição no site' : 'Ativar exibição no site'}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                        member.isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {member.isActive ? 'Ativo' : 'Inativo'}
                    </button>

                    {/* Botão Editar */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(member)}
                      className="p-2 text-ufrpe-blue-800 hover:bg-ufrpe-blue-50 rounded-lg transition"
                      title="Editar membro"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Botão Excluir */}
                    <button
                      type="button"
                      onClick={() => handleDelete(member)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Excluir membro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {modalOpen && editingMember && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 overflow-hidden my-8 animate-scale-up">
            {/* Header do Modal */}
            <div className="bg-ufrpe-blue-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold">
                  {editingMember.id ? 'Editar Membro da Equipe' : 'Novo Membro da Equipe'}
                </h3>
                <p className="text-xs text-ufrpe-green-300">
                  Preencha os dados institucionais e a foto para exibição no portal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário do Modal */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {errorMessage && (
                <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Seção da Foto com Pré-visualização Circular */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Pré-visualização Circular em Tempo Real */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-ufrpe-blue-600 shadow-md bg-white flex items-center justify-center flex-shrink-0">
                      {editingMember.photoUrl ? (
                        <Image
                          src={editingMember.photoUrl}
                          alt="Pré-visualização da foto"
                          fill
                          sizes="112px"
                          className="object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ufrpe-blue-800 to-ufrpe-blue-950 text-white font-extrabold text-xl">
                          {getInitials(editingMember.name || '')}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-2">
                      Recorte Circular
                    </span>
                  </div>

                  {/* Componente de Upload e Instruções */}
                  <div className="flex-1 w-full">
                    <FileUploadInput
                      label="Foto do Integrante"
                      value={editingMember.photoUrl}
                      onChange={(url) => setEditingMember({ ...editingMember, photoUrl: url })}
                      aspectRatioHint="1:1 (Quadrada)"
                      helperText="Orientações: Envie uma imagem quadrada com o rosto centralizado (JPG, PNG ou WebP). Ela será ajustada automaticamente em formato circular."
                    />
                  </div>
                </div>
              </div>

              {/* Nome Completo */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prof. Dr. André Silva Santos"
                  value={editingMember.name || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-ufrpe-blue-500 focus:border-ufrpe-blue-500 outline-none"
                />
              </div>

              {/* Grade: Titulação e Cargo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Titulação Acadêmica <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="degrees-list"
                    placeholder="Ex: Doutor em Ciência da Computação"
                    value={editingMember.degree || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, degree: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-ufrpe-blue-500 outline-none"
                  />
                  <datalist id="degrees-list">
                    <option value="Doutor em Ciência da Computação (UFPE)" />
                    <option value="Doutora em Agronomia" />
                    <option value="Mestre em Educação" />
                    <option value="Mestra em Gestão Pública" />
                    <option value="Especialista em Ensino de Ciências" />
                    <option value="Graduando em Bacharelado em Sistemas de Informação" />
                    <option value="Graduanda em Engenharia de Pesca" />
                    <option value="Graduando em Agronomia" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Cargo / Vínculo Institucional <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="roles-list"
                    placeholder="Ex: Professor Adjunto - UAST"
                    value={editingMember.role || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-ufrpe-blue-500 outline-none"
                  />
                  <datalist id="roles-list">
                    <option value="Professor Adjunto - UAST/UFRPE" />
                    <option value="Professora Associada - UAST/UFRPE" />
                    <option value="Técnico-Administrativo em Educação" />
                    <option value="Técnica em Assuntos Educacionais" />
                    <option value="Bolsista de Extensão (BEXT / UFRPE)" />
                    <option value="Monitor Voluntário de Extensão" />
                  </datalist>
                </div>
              </div>

              {/* Participação no SOU+UAST */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Participação no SOU+UAST <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={selectedRolePreset}
                    onChange={(e) => setSelectedRolePreset(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-ufrpe-blue-500 outline-none"
                  >
                    <option value="Coordenador">Coordenador (Destaque e prioridade)</option>
                    <option value="Membro">Membro</option>
                    <option value="Monitor">Monitor</option>
                    <option value="OUTRO">Outra função personalizada...</option>
                  </select>

                  {selectedRolePreset === 'OUTRO' && (
                    <input
                      type="text"
                      required
                      placeholder="Especifique a função (ex: Colaborador Externo)"
                      value={customRoleInput}
                      onChange={(e) => setCustomRoleInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-ufrpe-blue-500 outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Ordem de Exibição e Status Ativo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingMember.order || 1}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, order: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-ufrpe-blue-500 outline-none"
                  />
                  <span className="text-[11px] text-gray-400">
                    Coordenadores são exibidos primeiro automaticamente.
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingMember.isActive)}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, isActive: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ufrpe-green-700"></div>
                    <span className="ml-3 text-xs font-bold text-gray-700">
                      Exibir no Site Público
                    </span>
                  </label>
                </div>
              </div>

              {/* Botões do Rodapé do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-ufrpe-blue-900 hover:bg-ufrpe-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Membro</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
