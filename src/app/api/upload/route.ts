import { NextRequest, NextResponse } from 'next/server';
import { uploadArquivo, existeArquivoComNome, getPortariasFolderId } from '@/lib/drive';
import { detectarMimeType } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { nome, content } = await req.json();

    if (!nome || !content) {
      return NextResponse.json({ error: 'Nome e conteúdo são obrigatórios' }, { status: 400 });
    }

    // Verificar duplicata
    const jaExiste = await existeArquivoComNome(getPortariasFolderId(), nome);
    if (jaExiste) {
      return NextResponse.json({ status: 'duplicate' });
    }

    const buffer = Buffer.from(content, 'base64');
    const mimeType = detectarMimeType(nome);

    await uploadArquivo(nome, buffer, mimeType);

    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
