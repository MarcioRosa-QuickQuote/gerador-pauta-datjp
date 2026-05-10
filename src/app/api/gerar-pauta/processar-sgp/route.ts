import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrThrow } from '@/lib/google-auth';
import { exportarGoogleDoc } from '@/lib/drive';
import { parsearTextoPortarias, removerCabecalhoSGP } from '@/lib/parser';
import type { Portaria, NaoGerado } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const accessToken = session.accessToken!;
    const { sgpFileId }: { sgpFileId: string } = await req.json();

    const textoRaw = await exportarGoogleDoc(accessToken, sgpFileId);
    const texto = removerCabecalhoSGP(textoRaw);
    const parsed = parsearTextoPortarias(texto, 'Pauta SGP');

    const portarias: Portaria[] = [];
    const naoGerados: NaoGerado[] = [];
    for (const p of parsed) {
      if (p.numeroOriginal === 'Nº desconhecido' && p.data === 'Data desconhecida.' && p.conteudo === 'Conteúdo não encontrado.') {
        naoGerados.push({ nome: 'Pauta SGP', motivo: 'Portaria sem número, data ou conteúdo válido.' });
      } else { portarias.push(p); }
    }

    return NextResponse.json({ portarias, naoGerados });
  } catch (err: any) {
    if (err.message === 'Não autenticado') return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
