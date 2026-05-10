import { NextRequest, NextResponse } from 'next/server';
import { uploadArquivo, existeArquivoComNome, getFolderIdsFromRequest, getAccessTokenFromRequest } from '@/lib/drive';
import { detectarMimeType } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req);
    const { portarias: folderId } = await getFolderIdsFromRequest(req);
    const { nome, content } = await req.json();

    if (!nome || !content) {
      return NextResponse.json({ error: 'Nome e conteúdo são obrigatórios' }, { status: 400 });
    }

    const jaExiste = await existeArquivoComNome(accessToken, folderId, nome);
    if (jaExiste) {
      return NextResponse.json({ status: 'duplicate' });
    }

    const buffer = Buffer.from(content, 'base64');
    const mimeType = detectarMimeType(nome);
    await uploadArquivo(accessToken, nome, buffer, mimeType, folderId);

    return NextResponse.json({ status: 'success' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
