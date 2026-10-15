import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail, ShieldCheck, ExternalLink, ArrowUp } from 'lucide-react';
import { getAssetUrl } from '@/lib/api-client';

interface FooterProps {
  settings?: {
    siteName?: string;
    logoSouUast?: string | null;
    logoUfrpe?: string | null;
    footerAddress?: string | null;
    footerPhone?: string | null;
    footerEmail?: string | null;
    footerSocialInstagram?: string | null;
    footerSocialFacebook?: string | null;
    footerSocialYoutube?: string | null;
    footerInstitutionalLinks?: string | null;
    footerAccessibilityText?: string | null;
    footerCopyright?: string | null;
    lgpdNotice?: string | null;
  };
}

export default function Footer({ settings }: FooterProps) {
  // Parsing de links institucionais
  let institutionalLinks: Array<{ title: string; url: string }> = [
    { title: 'Portal Geral UFRPE', url: 'https://www.ufrpe.br' },
    { title: 'Portal Oficial UAST', url: 'https://uast.ufrpe.br' },
    { title: 'Ouvidoria UFRPE', url: 'https://falabr.cgu.gov.br' },
    { title: 'Acesso à Informação', url: 'https://www.gov.br/acessoainformacao' },
    { title: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br' },
    { title: 'Declaração de Acessibilidade', url: '/pagina/acessibilidade' },
    { title: 'Central de Ajuda', url: '/ajuda' },
  ];

  if (settings?.footerInstitutionalLinks) {
    try {
      const parsed = JSON.parse(settings.footerInstitutionalLinks);
      if (Array.isArray(parsed) && parsed.length > 0) {
        institutionalLinks = parsed;
      }
    } catch {
      // Fallback
    }
  }

  const address =
    settings?.footerAddress ||
    'Unidade Acadêmica de Serra Talhada - UAST / UFRPE\nFazenda Saco, s/n, Caixa Postal 063\nCEP: 56909-535 - Serra Talhada - PE';
  const phone = settings?.footerPhone || '(87) 3831-2900 / 3831-2910';
  const email = settings?.footerEmail || 'sou.uast@ufrpe.br';
  const copyright =
    settings?.footerCopyright ||
    '© 2025 SOU+UAST - Unidade Acadêmica de Serra Talhada / Universidade Federal Rural de Pernambuco. Todos os direitos reservados.';
  const accessibilityNotice =
    settings?.footerAccessibilityText ||
    'Este portal segue as diretrizes do Modelo de Acessibilidade em Governo Eletrônico (e-MAG) e normas internacionais WCAG 2.1 nível AA.';
  const lgpd =
    settings?.lgpdNotice ||
    'Em conformidade com a LGPD (Lei nº 13.709/2018), seus dados e privacidade são respeitados com total segurança e transparência.';

  return (
    <footer
      id="rodape-institucional"
      className="bg-ufrpe-blue-900 text-slate-200 border-t-4 border-ufrpe-green-700"
      role="contentinfo"
      aria-label="Rodapé institucional"
    >
      {/* Seção Principal do Rodapé */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Coluna 1: Identidade e Logotipos */}
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-lg shadow-inner inline-block max-w-[260px]">
              <Image
                src={getAssetUrl(settings?.logoSouUast || '/images/logo-sou-uast.svg')}
                alt="Logo do Projeto SOU+UAST"
                width={220}
                height={55}
                className="h-auto w-full object-contain"
              />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Projeto de Extensão Permanente dedicado à aproximação entre a universidade pública e a juventude sertaneja.
            </p>
            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-ufrpe-green-300 block mb-2">
                Siga nossas redes sociais:
              </span>
              <div className="flex items-center space-x-3">
                {settings?.footerSocialInstagram && (
                  <a
                    href={settings.footerSocialInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-ufrpe-blue-800 hover:bg-ufrpe-green-700 text-white rounded-full transition focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    aria-label="Acessar nosso perfil oficial no Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {settings?.footerSocialFacebook && (
                  <a
                    href={settings.footerSocialFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-ufrpe-blue-800 hover:bg-ufrpe-green-700 text-white rounded-full transition focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    aria-label="Acessar nossa página oficial no Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {settings?.footerSocialYoutube && (
                  <a
                    href={settings.footerSocialYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-ufrpe-blue-800 hover:bg-ufrpe-green-700 text-white rounded-full transition focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    aria-label="Acessar nosso canal oficial no YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Coluna 2: Localização e Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-ufrpe-blue-800 pb-2">
              Localização &amp; Contato
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-ufrpe-green-400 flex-shrink-0 mt-0.5" />
                <div className="whitespace-pre-line leading-relaxed">{address}</div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-ufrpe-green-400 flex-shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-ufrpe-green-400 flex-shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-white hover:underline focus:ring-1 focus:ring-yellow-400 rounded transition"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>

          {/* Coluna 3: Links Institucionais UFRPE */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-ufrpe-blue-800 pb-2">
              Links Institucionais
            </h3>
            <ul className="space-y-2 text-sm">
              {institutionalLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.url}
                    target={link.url.startsWith('http') ? '_blank' : undefined}
                    rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-slate-300 hover:text-white hover:underline flex items-center gap-1.5 focus:ring-1 focus:ring-yellow-400 rounded py-0.5 transition"
                  >
                    <span>{link.title}</span>
                    {link.url.startsWith('http') && <ExternalLink className="w-3 h-3 text-slate-400" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4: Conformidade, Acessibilidade e LGPD */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-ufrpe-blue-800 pb-2">
              Acessibilidade &amp; LGPD
            </h3>
            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <div className="flex items-start gap-2 bg-ufrpe-blue-800/60 p-3 rounded border border-ufrpe-blue-700">
                <ShieldCheck className="w-5 h-5 text-ufrpe-green-400 flex-shrink-0 mt-0.5" />
                <p>{accessibilityNotice}</p>
              </div>
              <p className="bg-ufrpe-blue-800/40 p-2.5 rounded border border-ufrpe-blue-800/80">
                <strong className="text-white block mb-1">Aviso de Privacidade:</strong>
                {lgpd}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Faixa Inferior de Copyright */}
      <div className="bg-ufrpe-blue-950 py-4 px-4 sm:px-6 lg:px-8 border-t border-ufrpe-blue-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
          <div>{copyright}</div>
          <div className="flex items-center space-x-4">
            <Link href="/pagina/acessibilidade" className="hover:text-slate-200 hover:underline">
              Acessibilidade e-MAG
            </Link>
            <span>•</span>
            <Link href="/ajuda" className="hover:text-slate-200 hover:underline">
              Ajuda
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-slate-200 hover:underline">
              Painel Interno
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
