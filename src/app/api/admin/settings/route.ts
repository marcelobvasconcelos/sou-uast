import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: 'site_settings' },
    });
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar configurações.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // Apenas ADMIN pode editar configurações gerais críticas
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permissão negada. Apenas Administradores podem alterar configurações do site.' }, { status: 403 });
    }

    const body = await req.json();

    const updated = await prisma.siteSetting.upsert({
      where: { id: 'site_settings' },
      update: {
        siteName: body.siteName,
        siteSubtitle: body.siteSubtitle,
        logoSouUast: body.logoSouUast,
        logoUfrpe: body.logoUfrpe,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        aboutTitle: body.aboutTitle,
        aboutText: body.aboutText,
        aboutButtonText: body.aboutButtonText,
        aboutButtonUrl: body.aboutButtonUrl,
        aboutImageUrl: body.aboutImageUrl,
        footerAddress: body.footerAddress,
        footerPhone: body.footerPhone,
        footerEmail: body.footerEmail,
        footerSocialInstagram: body.footerSocialInstagram,
        footerSocialFacebook: body.footerSocialFacebook,
        footerSocialYoutube: body.footerSocialYoutube,
        footerInstitutionalLinks: body.footerInstitutionalLinks,
        footerAccessibilityText: body.footerAccessibilityText,
        footerCopyright: body.footerCopyright,
        lgpdNotice: body.lgpdNotice,
        iframeWhitelist: body.iframeWhitelist,
        maxUploadSizeMb: body.maxUploadSizeMb ? Number(body.maxUploadSizeMb) : 15,
        teamSectionPosition: body.teamSectionPosition || 'AFTER_ABOUT',
        teamSectionTitle: body.teamSectionTitle || 'Nossa Equipe',
        teamSectionSubtitle: body.teamSectionSubtitle || 'Conheça os docentes, servidores e estudantes que constroem o SOU+UAST',
      },
      create: {
        id: 'site_settings',
        siteName: body.siteName || 'SOU+UAST',
        siteSubtitle: body.siteSubtitle || 'Projeto de Extensão - UAST/UFRPE',
        logoSouUast: body.logoSouUast || '/images/logo-sou-uast.svg',
        logoUfrpe: body.logoUfrpe || '/images/logo-ufrpe.svg',
        primaryColor: body.primaryColor || '#003366',
        secondaryColor: body.secondaryColor || '#006633',
        aboutTitle: body.aboutTitle || 'Sobre o Projeto SOU+UAST',
        aboutText: body.aboutText || '',
        aboutButtonText: body.aboutButtonText || 'Conheça o Projeto',
        aboutButtonUrl: body.aboutButtonUrl || '/pagina/sobre-o-projeto',
        aboutImageUrl: body.aboutImageUrl || null,
        footerAddress: body.footerAddress || '',
        footerPhone: body.footerPhone || '',
        footerEmail: body.footerEmail || '',
        footerSocialInstagram: body.footerSocialInstagram || '',
        footerSocialFacebook: body.footerSocialFacebook || '',
        footerSocialYoutube: body.footerSocialYoutube || '',
        footerInstitutionalLinks: body.footerInstitutionalLinks || '[]',
        footerAccessibilityText: body.footerAccessibilityText || '',
        footerCopyright: body.footerCopyright || '',
        lgpdNotice: body.lgpdNotice || '',
        iframeWhitelist: body.iframeWhitelist || 'youtube.com, vimeo.com, docs.google.com',
        maxUploadSizeMb: body.maxUploadSizeMb ? Number(body.maxUploadSizeMb) : 15,
        teamSectionPosition: body.teamSectionPosition || 'AFTER_ABOUT',
        teamSectionTitle: body.teamSectionTitle || 'Nossa Equipe',
        teamSectionSubtitle: body.teamSectionSubtitle || 'Conheça os docentes, servidores e estudantes que constroem o SOU+UAST',
      },
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'SETTINGS_CHANGE',
      entityType: 'Configurações',
      entityId: 'site_settings',
      details: `Configurações institucionais do site atualizadas pelo administrador.`,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao salvar configurações.' }, { status: 500 });
  }
}
