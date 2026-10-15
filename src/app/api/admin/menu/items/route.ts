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
    const { title, categoryId, parentId, pageId, url, openInNewTab, isActive } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Título do item é obrigatório.' }, { status: 400 });
    }

    const count = await prisma.menuItem.count({ where: { categoryId } });

    const item = await prisma.menuItem.create({
      data: {
        title,
        categoryId: categoryId || null,
        parentId: parentId || null,
        pageId: pageId || null,
        url: url || null,
        openInNewTab: Boolean(openInNewTab),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        order: count + 1,
      },
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'CREATE',
      entityType: 'Menu',
      entityId: item.id,
      details: `Item de menu "${item.title}" criado.`,
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar item de menu.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, categoryId, parentId, pageId, url, openInNewTab, isActive, order } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do item é obrigatório.' }, { status: 400 });
    }

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        parentId: parentId !== undefined ? parentId : undefined,
        pageId: pageId !== undefined ? pageId : undefined,
        url: url !== undefined ? url : undefined,
        openInNewTab: openInNewTab !== undefined ? Boolean(openInNewTab) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        order: order !== undefined ? Number(order) : undefined,
      },
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'UPDATE',
      entityType: 'Menu',
      entityId: item.id,
      details: `Item de menu "${item.title}" atualizado.`,
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar item.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do item não informado.' }, { status: 400 });
    }

    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Item não encontrado.' }, { status: 404 });
    }

    await prisma.menuItem.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'DELETE',
      entityType: 'Menu',
      entityId: id,
      details: `Item de menu "${existing.title}" excluído.`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao excluir item.' }, { status: 500 });
  }
}
