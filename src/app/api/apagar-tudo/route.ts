import { NextResponse } from 'next/server';
import { getSessionOrThrow } from '@/lib/google-auth';
import { listarArquivosDaPasta, apagarArquivo, ensureFolders } from '@/lib/drive';

export async function DELETE() {
  try {
    const session = await getSessionOrThrow();
    const accessToken = session.accessToken!;
    let portariasId = session.portariasFolderId;
    let pautasId = session.pautasFolderId;
    if (!portariasId || !pautasId) {
      const f = await ensureFolders(accessToken);
      portariasId = f.portarias;
      pautasId = f.pautas;
    }
    const portarias = await listarArquivosDaPasta(accessToken, portariasId);
    for (const f of portarias) await apagarArquivo(accessToken, f.id!);
    const pautas = await listarArquivosDaPasta(accessToken, pautasId);
    for (const f of pautas) await apagarArquivo(accessToken, f.id!);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === 'Não autenticado') return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
