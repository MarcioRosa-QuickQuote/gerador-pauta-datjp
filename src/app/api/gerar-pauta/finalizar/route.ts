import { NextRequest, NextResponse } from 'next/server';
import { escreverPortarias } from '@/lib/docs';
import { deduplicarPortarias, ordenarPortarias } from '@/lib/utils';
import type { Portaria, NaoGerado } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const {
      docId,
      portarias,
      naoGerados,
    }: { docId: string; portarias: Portaria[]; naoGerados: NaoGerado[] } = await req.json();

    // Deduplica e marca duplicadas
    let lista = deduplicarPortarias(portarias);

    // Ordena por ano depois por número
    lista = ordenarPortarias(lista);

    // Escreve no documento
    await escreverPortarias(docId, lista);

    const url = `https://docs.google.com/document/d/${docId}/edit`;

    return NextResponse.json({ url, naoGerados });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
