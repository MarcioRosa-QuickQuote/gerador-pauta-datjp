import { NextRequest, NextResponse } from 'next/server';
import { listarArquivosDaPasta, getFolderIdsFromRequest, getAccessTokenFromRequest } from '@/lib/drive';
import { isHoje } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req);
    const { sgp: folderId } = getFolderIdsFromRequest(req);
    const files = await listarArquivosDaPasta(accessToken, folderId);

    if (files.length === 0) {
      return NextResponse.json({ pronta: false });
    }

    let latestDate: string | null = null;
    for (const f of files) {
      const created = f.createdTime!;
      if (!latestDate || created > latestDate) latestDate = created;
    }

    return NextResponse.json({ pronta: isHoje(latestDate!) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
