import { NextResponse } from 'next/server';
import { listarPautasSubmetidas } from '@/lib/drive';

export async function GET() {
  try {
    const files = await listarPautasSubmetidas();
    const fileList = files.map((f) => ({ id: f.id!, nome: f.name! }));
    return NextResponse.json(fileList);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
