import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrThrow } from '@/lib/google-auth';
import { uploadArquivo, existeArquivoComNome, ensureFolders } from '@/lib/drive';
import { detectarMimeType } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const accessToken = session.accessToken!;
    let folderId = session.portariasFolderId;
    if (!folderId) {
      const folders = await ensureFolders(accessToken);
      folderId = folders.portarias;
    }

    const { nome, content } = await req.json();
    if (!nome || !content) {
      return NextResponse.json({ error: 'Nome e conteúdo são obrigatórios' }, { status: 400 });
    }

    const jaExiste = await existeArquivoComNome(accessToken, folderId, nome);
    if (jaExiste) return NextResponse.json({ status: 'duplicate' });

    const buffer = Buffer.from(content, 'base64');
    const mimeType = detectarMimeType(nome);
    await uploadArquivo(accessToken, nome, buffer, mimeType, folderId);

    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    if (err.message === 'Não autenticado') return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
