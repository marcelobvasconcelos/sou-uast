import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar Autenticação
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Acesso não autorizado. Faça login primeiro.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // 2. Validação de MIME Type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato inválido. Apenas imagens JPG, PNG, WebP e SVG são permitidas.' },
        { status: 400 }
      );
    }

    // 3. Obter Limite Máximo de Upload Configurado
    let maxMb = 15;
    try {
      const settings = await prisma.siteSetting.findUnique({ where: { id: 'site_settings' } });
      if (settings?.maxUploadSizeMb) {
        maxMb = settings.maxUploadSizeMb;
      }
    } catch {}

    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `O arquivo enviado (${(file.size / (1024 * 1024)).toFixed(1)} MB) ultrapassa o limite de ${maxMb} MB.` },
        { status: 400 }
      );
    }

    // 4. Salvar Arquivo de Forma Persistente
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await storage.saveFile(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error('Erro no processamento do upload:', error);
    return NextResponse.json(
      { error: 'Falha interna ao processar o upload do arquivo.' },
      { status: 500 }
    );
  }
}
