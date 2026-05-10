import { NextRequest, NextResponse } from 'next/server';
import { listarArquivosDaPasta, apagarArquivo, getFolderIdsFromRequest, getAccessTokenFromRequest } from '@/lib/drive';

export async function DELETE(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req);
    const folders = await getFolderIdsFromRequest(req);

    const portarias = await listarArquivosDaPasta(accessToken, folders.portarias);
    for (const f of portarias) {
      await apagarArquivo(accessToken, f.id!);
    }

    const pautas = await listarArquivosDaPasta(accessToken, folders.pautas);
    for (const f of pautas) {
      await apagarArquivo(accessToken, f.id!);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
