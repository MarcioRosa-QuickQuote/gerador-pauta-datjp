import { NextRequest, NextResponse } from 'next/server';
import { listarArquivosDaPasta, getFolderIdsFromRequest, getAccessTokenFromRequest } from '@/lib/drive';

export async function GET(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req);
    const { pautas: folderId } = getFolderIdsFromRequest(req);
    const files = await listarArquivosDaPasta(accessToken, folderId);
    return NextResponse.json(files.map((f) => ({ id: f.id!, nome: f.name! })));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
