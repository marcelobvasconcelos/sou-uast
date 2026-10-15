import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { sanitizeContent } from '@/lib/sanitize';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, slug, subtitle, bannerImage, status, blocks } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Título e slug são obrigatórios.' }, { status: 400 });
    }

    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Já existe uma página com este identificador (slug).' }, { status: 400 });
    }

    // Obter lista branca de iframes configurada
    const settings = await prisma.siteSetting.findUnique({ where: { id: 'site_settings' } });
    const allowedIframeDomains = settings?.iframeWhitelist
      ? settings.iframeWhitelist.split(/[\n,]/).map((d) => d.trim()).filter(Boolean)
      : undefined;

    // Sanitizar blocos de HTML
    const processedBlocks = (blocks || []).map((b: any, idx: number) => {
      let content = b.content;
      if (b.type === 'HTML' || b.type === 'RICH_TEXT') {
        content = sanitizeContent(b.content, { allowedIframeDomains });
      }
      return {
        type: b.type,
        order: idx,
        content,
        settings: b.settings || null,
      };
    });

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        subtitle: subtitle || null,
        bannerImage: bannerImage || null,
        status: status || 'PUBLISHED',
        blocks: {
          create: processedBlocks,
        },
      },
      include: {
        blocks: true,
      },
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'CREATE',
      entityType: 'Página',
      entityId: page.id,
      details: `Página institucional "${page.title}" criada com ${processedBlocks.length} blocos.`,
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error('Erro ao cadastrar página:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}
