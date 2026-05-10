import { NextRequest, NextResponse } from 'next/server';
import { gerarDocxBuffer } from '@/lib/docs';
import { moverParaPasta, tornarPublico, getAccessTokenFromRequest } from '@/lib/drive';
import { deduplicarPortarias, ordenarPortarias } from '@/lib/utils';
import type { Portaria, NaoGerado } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req);
    const {
      portarias,
      naoGerados,
      titulo,
      pautasFolderId,
    }: { portarias: Portaria[]; naoGerados: NaoGerado[]; titulo: string; pautasFolderId: string } = await req.json();

    let lista = deduplicarPortarias(portarias);
    lista = ordenarPortarias(lista);

    // Gera .docx
    const buffer = await gerarDocxBuffer(lista);

    // Upload para Drive
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
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    if (!uploadRes.ok) throw new Error(`Upload error ${uploadRes.status}`);
    const { id: docId } = await uploadRes.json();

    // Permissão pública
    await tornarPublico(accessToken, docId);

    // Link do arquivo no Drive
    const url = `https://drive.google.com/file/d/${docId}/view`;

    return NextResponse.json({ url, naoGerados });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
