import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listarArquivosDaPasta, ensureFolders } from '@/lib/drive';
import { isHoje } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) return NextResponse.json({ pronta: false });

    const accessToken = session.accessToken;
    let folderId = session.sgpFolderId;
    if (!folderId) {
      try {
        const f = await ensureFolders(accessToken);
        folderId = f.sgp;
      } catch {
        return NextResponse.json({ pronta: false });
      }
    }

    const files = await listarArquivosDaPasta(accessToken, folderId);
    if (files.length === 0) return NextResponse.json({ pronta: false });

    let latestDate: string | null = null;
    for (const f of files) {
      const created = f.createdTime!;
      if (!latestDate || created > latestDate) latestDate = created;
    }
    return NextResponse.json({ pronta: isHoje(latestDate!) });
  } catch {
    return NextResponse.json({ pronta: false });
  }
}
