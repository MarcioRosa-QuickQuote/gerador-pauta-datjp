import { NextRequest, NextResponse } from 'next/server';
import { apagarArquivo, getAccessTokenFromRequest } from '@/lib/drive';

export async function DELETE(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    await apagarArquivo(accessToken, id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
