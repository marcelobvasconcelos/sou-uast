import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const rawFilename = params.filename;
    if (!rawFilename) {
      return new NextResponse('Arquivo não informado', { status: 400 });
    }

    const decodedFilename = decodeURIComponent(rawFilename);
    const safeName = path.basename(decodedFilename);

    let filePath = storage.getFilePath(safeName);

    // Fallbacks para garantir localização precisa em qualquer ambiente (container / host)
    if (!fs.existsSync(filePath)) {
      const candidates = [
        path.join(process.cwd(), 'uploads', safeName),
        path.join('/app', 'uploads', safeName),
        path.join(process.cwd(), 'public', 'uploads', safeName),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          filePath = candidate;
          break;
        }
      }
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Arquivo não encontrado', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    // Determinar Content-Type
    const ext = path.extname(safeName).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.mp4') contentType = 'video/mp4';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Erro ao servir arquivo de upload:', error);
    return new NextResponse('Erro interno', { status: 500 });
  }
}
