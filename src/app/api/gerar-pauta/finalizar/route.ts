import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrThrow } from '@/lib/google-auth';
import { gerarDocxBuffer } from '@/lib/docs';
import { tornarPublico } from '@/lib/drive';
import { deduplicarPortarias, ordenarPortarias } from '@/lib/utils';
import type { Portaria, NaoGerado } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const accessToken = session.accessToken!;
    const { portarias, naoGerados, titulo, pautasFolderId }: {
      portarias: Portaria[]; naoGerados: NaoGerado[]; titulo: string; pautasFolderId: string;
    } = await req.json();

    let lista = deduplicarPortarias(portarias);
    lista = ordenarPortarias(lista);
    const buffer = await gerarDocxBuffer(lista);

    const boundary = `-------${Date.now()}`;
    const metadata = JSON.stringify({ name: `${titulo}.docx`, parents: [pautasFolderId] });
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`),
      buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    });
    if (!uploadRes.ok) throw new Error(`Upload error ${uploadRes.status}`);
    const { id: docId } = await uploadRes.json();

    await tornarPublico(accessToken, docId);
    const url = `https://drive.google.com/file/d/${docId}/view`;

    return NextResponse.json({ url, naoGerados });
  } catch (err: any) {
    if (err.message === 'Não autenticado') return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
