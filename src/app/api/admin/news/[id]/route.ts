import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

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
    const { title, slug, summary, content, featuredImage, isFeatured, status, publishedAt } = body;

    // Verificar existência
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Notícia não encontrada.' }, { status: 404 });
    }

    // Se o slug mudou, checar unicidade
    if (slug !== existing.slug) {
      const slugConflict = await prisma.news.findUnique({ where: { slug } });
      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json({ error: 'Esta URL amigável (slug) já está em uso por outra notícia.' }, { status: 400 });
      }
    }

    const updated = await prisma.news.update({
      where: { id },
      data: {
        title,
        slug,
        summary,
        content,
        featuredImage: featuredImage || null,
        isFeatured: Boolean(isFeatured),
        status: status || 'PUBLISHED',
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      },
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: status !== existing.status ? (status === 'PUBLISHED' ? 'PUBLISH' : 'UNPUBLISH') : 'UPDATE',
      entityType: 'Notícia',
      entityId: updated.id,
      details: `Notícia "${updated.title}" atualizada. Destaque: ${updated.isFeatured}, Status: ${updated.status}.`,
    });

    return NextResponse.json({ success: true, news: updated });
  } catch (error: any) {
    console.error('Erro ao atualizar notícia:', error);
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
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Notícia não encontrada.' }, { status: 404 });
    }

    await prisma.news.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'DELETE',
      entityType: 'Notícia',
      entityId: id,
      details: `Notícia "${existing.title}" excluída do sistema.`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir notícia:', error);
    return NextResponse.json({ error: error.message || 'Erro ao excluir.' }, { status: 500 });
  }
}
