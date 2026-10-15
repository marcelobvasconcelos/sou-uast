import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { slugify } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'O nome da categoria é obrigatório.' }, { status: 400 });
    }

    const slug = slugify(name);
    const existingCount = await prisma.category.count();

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        order: existingCount + 1,
      },
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'CREATE',
      entityType: 'Categoria',
      entityId: category.id,
      details: `Categoria "${category.name}" criada.`,
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar categoria.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { id, name, order, isActive } = await req.json();
    if (!id || !name?.trim()) {
      return NextResponse.json({ error: 'ID e nome são obrigatórios.' }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: slugify(name),
        order: order !== undefined ? order : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'UPDATE',
      entityType: 'Categoria',
      entityId: category.id,
      details: `Categoria "${category.name}" atualizada.`,
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar categoria.' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID da categoria não informado.' }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 });
    }

    await prisma.category.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'DELETE',
      entityType: 'Categoria',
      entityId: id,
      details: `Categoria "${existing.name}" excluída.`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao excluir categoria.' }, { status: 500 });
  }
}
