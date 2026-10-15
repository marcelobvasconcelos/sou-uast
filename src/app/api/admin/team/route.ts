import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// GET /api/admin/team - Listar todos os membros da equipe para o painel
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const members = await prisma.teamMember.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, members });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar membros da equipe.' },
      { status: 500 }
    );
  }
}

// POST /api/admin/team - Criar novo membro da equipe
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, degree, role, projectRole, photoUrl, order, isActive } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'O nome completo é obrigatório.' }, { status: 400 });
    }
    if (!degree?.trim()) {
      return NextResponse.json({ error: 'A titulação é obrigatória.' }, { status: 400 });
    }
    if (!role?.trim()) {
      return NextResponse.json({ error: 'O cargo é obrigatório.' }, { status: 400 });
    }
    if (!projectRole?.trim()) {
      return NextResponse.json(
        { error: 'A participação no projeto é obrigatória.' },
        { status: 400 }
      );
    }

    // Se a ordem não for informada, posiciona no fim
    let memberOrder = Number(order);
    if (isNaN(memberOrder)) {
      const count = await prisma.teamMember.count();
      memberOrder = count + 1;
    }

    const member = await prisma.teamMember.create({
      data: {
        name: name.trim(),
        degree: degree.trim(),
        role: role.trim(),
        projectRole: projectRole.trim(),
        photoUrl: photoUrl?.trim() || null,
        order: memberOrder,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'CREATE',
      entityType: 'Equipe',
      entityId: member.id,
      details: `Membro da equipe "${member.name}" (${member.projectRole}) cadastrado.`,
    });

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar membro da equipe.' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/team - Atualizar membro da equipe existente ou reordenar lista
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();

    // Reordenação em lote: { reorder: [{ id, order }, ...] }
    if (Array.isArray(body.reorder)) {
      const updates = body.reorder.map((item: { id: string; order: number }) =>
        prisma.teamMember.update({
          where: { id: item.id },
          data: { order: Number(item.order) },
        })
      );
      await prisma.$transaction(updates);

      await logAudit({
        userId: session.user.id,
        userName: session.user.name,
        userEmail: session.user.email,
        action: 'UPDATE',
        entityType: 'Equipe',
        details: 'Ordem de exibição dos membros da equipe atualizada.',
      });

      return NextResponse.json({ success: true, message: 'Ordem atualizada com sucesso.' });
    }

    const { id, name, degree, role, projectRole, photoUrl, order, isActive } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID do membro é obrigatório.' }, { status: 400 });
    }

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Membro não encontrado.' }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (degree !== undefined) updateData.degree = degree.trim();
    if (role !== undefined) updateData.role = role.trim();
    if (projectRole !== undefined) updateData.projectRole = projectRole.trim();
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl ? photoUrl.trim() : null;
    if (order !== undefined) updateData.order = Number(order);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const member = await prisma.teamMember.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'UPDATE',
      entityType: 'Equipe',
      entityId: member.id,
      details: `Membro da equipe "${member.name}" atualizado.`,
    });

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar membro da equipe.' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/team - Remover membro da equipe
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do membro não fornecido.' }, { status: 400 });
    }

    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Membro não encontrado.' }, { status: 404 });
    }

    await prisma.teamMember.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'DELETE',
      entityType: 'Equipe',
      entityId: id,
      details: `Membro da equipe "${existing.name}" removido.`,
    });

    return NextResponse.json({ success: true, message: 'Membro removido com sucesso.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao remover membro da equipe.' },
      { status: 500 }
    );
  }
}
