import { NextRequest, NextResponse } from 'next/server';
import { exportarGoogleDoc, getAccessTokenFromRequest } from '@/lib/drive';
import { parsearTextoPortarias, removerCabecalhoSGP } from '@/lib/parser';
import type { Portaria, NaoGerado } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req);
    const { sgpFileId }: { sgpFileId: string } = await req.json();

    const portarias: Portaria[] = [];
    const naoGerados: NaoGerado[] = [];

    const textoRaw = await exportarGoogleDoc(accessToken, sgpFileId);
    const texto = removerCabecalhoSGP(textoRaw);
    const parsed = parsearTextoPortarias(texto, 'Pauta SGP');

    for (const p of parsed) {
      if (
        p.numeroOriginal === 'Nº desconhecido' &&
        p.data === 'Data desconhecida.' &&
        p.conteudo === 'Conteúdo não encontrado.'
      ) {
        naoGerados.push({ nome: 'Pauta SGP', motivo: 'Portaria sem número, data ou conteúdo válido.' });
      } else {
        portarias.push(p);
      }
    }

    return NextResponse.json({ portarias, naoGerados });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
