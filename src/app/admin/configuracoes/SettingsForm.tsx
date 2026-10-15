'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Building2,
  Palette,
  Share2,
  ShieldCheck,
  FileCode,
  LayoutTemplate
} from 'lucide-react';
import FileUploadInput from '@/components/admin/FileUploadInput';

interface SettingsFormProps {
  initialSettings?: any;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    siteName: initialSettings?.siteName || 'SOU+UAST',
    siteSubtitle: initialSettings?.siteSubtitle || 'Projeto de Extensão - UAST / UFRPE',
    logoSouUast: initialSettings?.logoSouUast || '/images/logo-sou-uast.svg',
    logoUfrpe: initialSettings?.logoUfrpe || '/images/logo-ufrpe.svg',
    primaryColor: initialSettings?.primaryColor || '#003366',
    secondaryColor: initialSettings?.secondaryColor || '#006633',
    aboutTitle: initialSettings?.aboutTitle || 'Sobre o Projeto SOU+UAST',
    aboutText: initialSettings?.aboutText || '',
    aboutButtonText: initialSettings?.aboutButtonText || 'Conheça o Projeto',
    aboutButtonUrl: initialSettings?.aboutButtonUrl || '/pagina/sobre-o-projeto',
    aboutImageUrl: initialSettings?.aboutImageUrl || '/images/banners/sobre-uast.svg',
    footerAddress: initialSettings?.footerAddress || '',
    footerPhone: initialSettings?.footerPhone || '',
    footerEmail: initialSettings?.footerEmail || '',
    footerSocialInstagram: initialSettings?.footerSocialInstagram || '',
    footerSocialFacebook: initialSettings?.footerSocialFacebook || '',
    footerSocialYoutube: initialSettings?.footerSocialYoutube || '',
    footerInstitutionalLinks: initialSettings?.footerInstitutionalLinks || '[]',
    footerAccessibilityText: initialSettings?.footerAccessibilityText || '',
    footerCopyright: initialSettings?.footerCopyright || '',
    lgpdNotice: initialSettings?.lgpdNotice || '',
    iframeWhitelist: initialSettings?.iframeWhitelist || 'youtube.com, www.youtube.com, player.vimeo.com, docs.google.com, forms.gle, google.com/maps',
    maxUploadSizeMb: initialSettings?.maxUploadSizeMb || 15,
  });

  const [activeTab, setActiveTab] = useState<'geral' | 'home' | 'rodape' | 'redes' | 'seguranca'>('geral');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar configurações.');
      }

      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Barra de Abas de Navegação das Configurações */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('geral')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'geral'
              ? 'bg-ufrpe-blue-800 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-slate-100 border'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Identidade &amp; Logos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'home'
              ? 'bg-ufrpe-blue-800 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-slate-100 border'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Seção "Sobre" na Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rodape')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'rodape'
              ? 'bg-ufrpe-blue-800 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-slate-100 border'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Rodapé Institucional (UAST)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('redes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'redes'
              ? 'bg-ufrpe-blue-800 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-slate-100 border'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Redes Sociais</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seguranca')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'seguranca'
              ? 'bg-ufrpe-blue-800 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-slate-100 border'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Segurança &amp; iFrames</span>
        </button>
      </div>

      {/* Alertas */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
          <span>Configurações salvas e aplicadas com sucesso em todo o portal!</span>
        </div>
      )}

      {/* ABA 1: IDENTIDADE & LOGOS */}
      {activeTab === 'geral' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-ufrpe-blue-900 border-b pb-2">
            Identidade Institucional e Logotipos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nome do Site / Projeto
              </label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Subtítulo Institucional
              </label>
              <input
                type="text"
                value={formData.siteSubtitle}
                onChange={(e) => setFormData({ ...formData, siteSubtitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <FileUploadInput
              label="Logotipo do Projeto SOU+UAST"
              value={formData.logoSouUast}
              onChange={(url) => setFormData({ ...formData, logoSouUast: url })}
              aspectRatioHint="Horizontal (Ex: 320x80)"
              helperText="Substitui o logotipo padrão exibido no cabeçalho e rodapé."
            />

            <FileUploadInput
              label="Logotipo da UAST / UFRPE"
              value={formData.logoUfrpe}
              onChange={(url) => setFormData({ ...formData, logoUfrpe: url })}
              aspectRatioHint="Horizontal (Ex: 280x80)"
              helperText="Logotipo oficial da universidade/unidade."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Cor Primária Institucional (Hexadecimal)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-32 px-3 py-1.5 border rounded-lg font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Cor Secundária Institucional (Hexadecimal)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-32 px-3 py-1.5 border rounded-lg font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: SEÇÃO SOBRE NA HOME */}
      {activeTab === 'home' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-ufrpe-blue-900 border-b pb-2">
            Bloco "Sobre o Projeto" da Página Inicial
          </h2>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Título do Bloco
            </label>
            <input
              type="text"
              value={formData.aboutTitle}
              onChange={(e) => setFormData({ ...formData, aboutTitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Texto Institucional Apresentado
            </label>
            <textarea
              rows={5}
              value={formData.aboutText}
              onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Texto do Botão
              </label>
              <input
                type="text"
                value={formData.aboutButtonText}
                onChange={(e) => setFormData({ ...formData, aboutButtonText: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Destino do Botão (URL)
              </label>
              <input
                type="text"
                value={formData.aboutButtonUrl}
                onChange={(e) => setFormData({ ...formData, aboutButtonUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <FileUploadInput
            label="Imagem Ilustrativa do Bloco"
            value={formData.aboutImageUrl}
            onChange={(url) => setFormData({ ...formData, aboutImageUrl: url })}
            aspectRatioHint="4:3 ou 16:9"
          />
        </div>
      )}

      {/* ABA 3: RODAPÉ INSTITUCIONAL (PADRÃO UAST) */}
      {activeTab === 'rodape' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-ufrpe-blue-900 border-b pb-2">
            Rodapé Institucional (Padrão uast.ufrpe.br)
          </h2>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Endereço Completo da Unidade
            </label>
            <textarea
              rows={3}
              value={formData.footerAddress}
              onChange={(e) => setFormData({ ...formData, footerAddress: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Telefones de Atendimento
              </label>
              <input
                type="text"
                value={formData.footerPhone}
                onChange={(e) => setFormData({ ...formData, footerPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                E-mail Institucional de Contato
              </label>
              <input
                type="email"
                value={formData.footerEmail}
                onChange={(e) => setFormData({ ...formData, footerEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Aviso de Copyright e Direitos Reservados
            </label>
            <input
              type="text"
              value={formData.footerCopyright}
              onChange={(e) => setFormData({ ...formData, footerCopyright: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Declaração de Acessibilidade (e-MAG / WCAG)
            </label>
            <textarea
              rows={2}
              value={formData.footerAccessibilityText}
              onChange={(e) => setFormData({ ...formData, footerAccessibilityText: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Aviso de Privacidade e Conformidade com a LGPD
            </label>
            <textarea
              rows={2}
              value={formData.lgpdNotice}
              onChange={(e) => setFormData({ ...formData, lgpdNotice: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      )}

      {/* ABA 4: REDES SOCIAIS */}
      {activeTab === 'redes' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-ufrpe-blue-900 border-b pb-2">
            Canais Oficiais nas Redes Sociais
          </h2>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Link do Perfil no Instagram Oficial
            </label>
            <input
              type="url"
              value={formData.footerSocialInstagram}
              onChange={(e) => setFormData({ ...formData, footerSocialInstagram: e.target.value })}
              placeholder="https://www.instagram.com/uast_ufrpe/"
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Link da Página no Facebook Oficial
            </label>
            <input
              type="url"
              value={formData.footerSocialFacebook}
              onChange={(e) => setFormData({ ...formData, footerSocialFacebook: e.target.value })}
              placeholder="https://www.facebook.com/ufrpeoficial"
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Link do Canal no YouTube Oficial
            </label>
            <input
              type="url"
              value={formData.footerSocialYoutube}
              onChange={(e) => setFormData({ ...formData, footerSocialYoutube: e.target.value })}
              placeholder="https://www.youtube.com/@ufrpeoficial"
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
            />
          </div>
        </div>
      )}

      {/* ABA 5: SEGURANÇA, IFRAMES E UPLOADS */}
      {activeTab === 'seguranca' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-ufrpe-blue-900 border-b pb-2">
            Segurança, Whitelist de iFrames e Uploads
          </h2>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Lista Branca de Domínios Permitidos em Blocos HTML/iFrames
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Separe os domínios por vírgula ou por linha. Apenas iframes de domínios nesta lista serão renderizados nas páginas.
            </p>
            <textarea
              rows={4}
              value={formData.iframeWhitelist}
              onChange={(e) => setFormData({ ...formData, iframeWhitelist: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Limite Máximo para Uploads (MB)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={formData.maxUploadSizeMb}
              onChange={(e) => setFormData({ ...formData, maxUploadSizeMb: Number(e.target.value) })}
              className="w-32 px-3 py-2 border rounded-lg text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Padrão recomendado: 15 MB por arquivo.</p>
          </div>
        </div>
      )}

      {/* Botão de Salvar Fixo */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ufrpe-green-700 hover:bg-ufrpe-green-800 text-white rounded-lg text-sm font-bold shadow-md transition disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Salvar Todas as Configurações</span>
        </button>
      </div>
    </form>
  );
}
