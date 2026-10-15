import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, slug, summary, content, featuredImage, isFeatured, status, publishedAt } = body;

    if (!title || !slug || !summary || !content) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos.' }, { status: 400 });
    }

    // Verificar se slug já existe
    const existing = await prisma.news.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Já existe uma notícia com esta URL amigável (slug).' }, { status: 400 });
    }

    const news = await prisma.news.create({
      data: {
        title,
        slug,
        summary,
        content,
        featuredImage: featuredImage || null,
        isFeatured: Boolean(isFeatured),
        status: status || 'PUBLISHED',
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        authorId: session.user.id,
      },
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: status === 'PUBLISHED' ? 'PUBLISH' : 'CREATE',
      entityType: 'Notícia',
      entityId: news.id,
      details: `Notícia "${news.title}" cadastrada com status ${news.status}.`,
    });

    return NextResponse.json({ success: true, news });
  } catch (error: any) {
    console.error('Erro ao cadastrar notícia:', error);
    return NextResponse.json({ error: error.message || 'Erro interno ao salvar notícia.' }, { status: 500 });
  }
}
