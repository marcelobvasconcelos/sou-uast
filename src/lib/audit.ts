import { prisma } from './prisma';

export interface AuditParams {
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'UNPUBLISH' | 'LOGIN' | 'SETTINGS_CHANGE';
  entityType: 'Notícia' | 'Página' | 'Menu' | 'Categoria' | 'Banner' | 'Usuário' | 'Configurações' | 'Sistema' | 'Equipe';
  entityId?: string | null;
  details?: string;
  ipAddress?: string | null;
}

export async function logAudit(params: AuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userName: params.userName || null,
        userEmail: params.userEmail || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        details: params.details || null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Falha ao gravar log de auditoria:', error);
    return null;
  }
}
