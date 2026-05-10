import { NextRequest, NextResponse } from 'next/server';
import { listarArquivosDaPasta, getFolderIdsFromRequest, getAccessTokenFromRequest } from '@/lib/drive';
import { gerarNomePauta } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req);
    const folders = getFolderIdsFromRequest(req);

    const portarias = await listarArquivosDaPasta(accessToken, folders.portarias);
    const sgpFiles = await listarArquivosDaPasta(accessToken, folders.sgp);

    const fileInfos = portarias.map((f) => ({ id: f.id!, nome: f.name! }));
    const sgpFileId = sgpFiles.length > 0 ? sgpFiles[0].id! : null;

    if (fileInfos.length === 0 && !sgpFileId) {
      return NextResponse.json({ error: 'Nenhum arquivo para gerar a pauta.' }, { status: 400 });
    }

    const titulo = gerarNomePauta();

    return NextResponse.json({ docId: '', fileInfos, sgpFileId, titulo, pautasFolderId: folders.pautas });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
