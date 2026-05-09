import { NextResponse } from 'next/server';
import { listarPortarias, listarSGP } from '@/lib/drive';
import { criarDocPauta } from '@/lib/docs';
import { gerarNomePauta } from '@/lib/utils';

export async function POST() {
  try {
    // Listar arquivos
    const portarias = await listarPortarias();
    const sgpFiles = await listarSGP();

    const fileInfos = portarias.map((f) => ({
      id: f.id!,
      nome: f.name!,
    }));

    const sgpFileId = sgpFiles.length > 0 ? sgpFiles[0].id! : null;

    if (fileInfos.length === 0 && !sgpFileId) {
      return NextResponse.json(
        { error: 'Nenhum arquivo para gerar a pauta.' },
        { status: 400 }
      );
    }

    // Criar doc vazio
    const titulo = gerarNomePauta();
    const docId = await criarDocPauta(titulo);

    return NextResponse.json({ docId, fileInfos, sgpFileId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
