import { NextResponse } from 'next/server';
import { listarPortarias, listarPautasSubmetidas, apagarArquivo } from '@/lib/drive';

export async function DELETE() {
  try {
    // Apagar todas as portarias
    const portarias = await listarPortarias();
    for (const f of portarias) {
      await apagarArquivo(f.id!);
    }

    // Apagar todas as pautas
    const pautas = await listarPautasSubmetidas();
    for (const f of pautas) {
      await apagarArquivo(f.id!);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
