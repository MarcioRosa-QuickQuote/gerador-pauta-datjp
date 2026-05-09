import { NextResponse } from 'next/server';
import { listarSGP } from '@/lib/drive';
import { isHoje } from '@/lib/utils';

export async function GET() {
  try {
    const files = await listarSGP();

    if (files.length === 0) {
      return NextResponse.json({ pronta: false });
    }

    // Encontrar o arquivo mais recente
    let latestDate: string | null = null;
    for (const f of files) {
      const created = f.createdTime!;
      if (!latestDate || created > latestDate) {
        latestDate = created;
      }
    }

    const pronta = isHoje(latestDate!);
    return NextResponse.json({ pronta });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
