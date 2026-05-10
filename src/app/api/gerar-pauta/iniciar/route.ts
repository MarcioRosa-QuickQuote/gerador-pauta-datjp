import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrThrow } from '@/lib/google-auth';
import { listarArquivosDaPasta, ensureFolders } from '@/lib/drive';
import { gerarNomePauta } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const accessToken = session.accessToken!;
    let portariasId = session.portariasFolderId;
    let pautasId = session.pautasFolderId;
    let sgpId = session.sgpFolderId;

    if (!portariasId || !pautasId || !sgpId) {
      const folders = await ensureFolders(accessToken);
      portariasId = folders.portarias;
      pautasId = folders.pautas;
      sgpId = folders.sgp;
    }

    const portarias = await listarArquivosDaPasta(accessToken, portariasId);
    const sgpFiles = await listarArquivosDaPasta(accessToken, sgpId);

    const fileInfos = portarias.map((f) => ({ id: f.id!, nome: f.name! }));
    const sgpFileId = sgpFiles.length > 0 ? sgpFiles[0].id! : null;

    if (fileInfos.length === 0 && !sgpFileId) {
      return NextResponse.json({ error: 'Nenhum arquivo para gerar a pauta.' }, { status: 400 });
    }

    return NextResponse.json({
      docId: '',
      fileInfos,
      sgpFileId,
      titulo: gerarNomePauta(),
      pautasFolderId: pautasId,
    });
  } catch (err: any) {
    if (err.message === 'Não autenticado') return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
