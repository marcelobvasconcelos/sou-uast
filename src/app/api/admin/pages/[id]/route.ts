import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { sanitizeContent } from '@/lib/sanitize';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { title, slug, subtitle, bannerImage, status, blocks } = body;

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Página não encontrada.' }, { status: 404 });
    }

    if (slug !== existing.slug) {
      const conflict = await prisma.page.findUnique({ where: { slug } });
      if (conflict && conflict.id !== id) {
        return NextResponse.json({ error: 'Este slug já está em uso por outra página.' }, { status: 400 });
      }
    }

    // Obter lista branca de iframes configurada
    const settings = await prisma.siteSetting.findUnique({ where: { id: 'site_settings' } });
    const allowedIframeDomains = settings?.iframeWhitelist
      ? settings.iframeWhitelist.split(/[\n,]/).map((d) => d.trim()).filter(Boolean)
      : undefined;

    // Sanitizar blocos
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

    // Atualizar página e substituir blocos em transação
    const updated = await prisma.$transaction(async (tx) => {
      // Deletar blocos anteriores
      await tx.pageBlock.deleteMany({ where: { pageId: id } });

      // Atualizar página com novos blocos
      return tx.page.update({
        where: { id },
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
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'UPDATE',
      entityType: 'Página',
      entityId: updated.id,
      details: `Página "${updated.title}" atualizada com ${processedBlocks.length} blocos.`,
    });

    return NextResponse.json({ success: true, page: updated });
  } catch (error: any) {
    console.error('Erro ao atualizar página:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Página não encontrada.' }, { status: 404 });
    }

    await prisma.page.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'DELETE',
      entityType: 'Página',
      entityId: id,
      details: `Página "${existing.title}" excluída.`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir página:', error);
    return NextResponse.json({ error: error.message || 'Erro ao excluir.' }, { status: 500 });
  }
}
