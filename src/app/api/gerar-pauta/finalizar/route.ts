import { NextRequest, NextResponse } from 'next/server';
import { escreverPortarias } from '@/lib/docs';
import { getAccessTokenFromRequest } from '@/lib/drive';
import { deduplicarPortarias, ordenarPortarias } from '@/lib/utils';
import type { Portaria, NaoGerado } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req);
    const {
      docId,
      portarias,
      naoGerados,
    }: { docId: string; portarias: Portaria[]; naoGerados: NaoGerado[] } = await req.json();

    let lista = deduplicarPortarias(portarias);
    lista = ordenarPortarias(lista);
    await escreverPortarias(accessToken, docId, lista);

    const url = `https://docs.google.com/document/d/${docId}/edit`;
    return NextResponse.json({ url, naoGerados });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
