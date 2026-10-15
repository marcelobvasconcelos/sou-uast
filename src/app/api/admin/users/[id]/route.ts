import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, email, password, role, isActive } = body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email.toLowerCase().trim();
    if (role) dataToUpdate.role = role === 'ADMIN' ? 'ADMIN' : 'EDITOR';
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);
    if (password && password.trim()) {
      dataToUpdate.password = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'UPDATE',
      entityType: 'Usuário',
      entityId: updated.id,
      details: `Dados do usuário ${updated.name} (${updated.email}) atualizados. Papel: ${updated.role}, Ativo: ${updated.isActive}.`,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar usuário.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const { id } = params;

    // Não permitir que o usuário exclua a si mesmo
    if (session.user.id === id) {
      return NextResponse.json({ error: 'Você não pode excluir sua própria conta conectada.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    await logAudit({
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      action: 'DELETE',
      entityType: 'Usuário',
      entityId: id,
      details: `Usuário "${existing.name}" (${existing.email}) removido pelo administrador.`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao excluir usuário.' }, { status: 500 });
  }
}
