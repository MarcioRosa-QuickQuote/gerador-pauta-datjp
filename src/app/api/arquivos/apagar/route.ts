import { NextRequest, NextResponse } from 'next/server';
import { getSessionOrThrow } from '@/lib/google-auth';
import { apagarArquivo } from '@/lib/drive';

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const accessToken = session.accessToken!;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    await apagarArquivo(accessToken, id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === 'Não autenticado') return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
