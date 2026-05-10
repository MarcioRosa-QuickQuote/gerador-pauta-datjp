import { NextResponse } from 'next/server';
import { getSessionOrThrow } from '@/lib/google-auth';
import { listarArquivosDaPasta, ensureFolders } from '@/lib/drive';

export async function GET() {
  try {
    const session = await getSessionOrThrow();
    const accessToken = session.accessToken!;
    let folderId = session.pautasFolderId;
    if (!folderId) { const f = await ensureFolders(accessToken); folderId = f.pautas; }
    const files = await listarArquivosDaPasta(accessToken, folderId);
    return NextResponse.json(files.map((f) => ({ id: f.id!, nome: f.name! })));
  } catch (err: any) {
    if (err.message === 'Não autenticado') return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
