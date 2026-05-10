import { NextResponse } from 'next/server';
import { getSessionOrThrow } from '@/lib/google-auth';
import { listarArquivosDaPasta, ensureFolders } from '@/lib/drive';
import { isHoje } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getSessionOrThrow();
    const accessToken = session.accessToken!;
    let folderId = session.sgpFolderId;
    if (!folderId) {
      const f = await ensureFolders(accessToken);
      folderId = f.sgp;
    }
    const files = await listarArquivosDaPasta(accessToken, folderId);
    if (files.length === 0) return NextResponse.json({ pronta: false });

    let latestDate: string | null = null;
    for (const f of files) {
      const created = f.createdTime!;
      if (!latestDate || created > latestDate) latestDate = created;
    }
    return NextResponse.json({ pronta: isHoje(latestDate!) });
  } catch (err: any) {
    if (err.message === 'Não autenticado') return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
