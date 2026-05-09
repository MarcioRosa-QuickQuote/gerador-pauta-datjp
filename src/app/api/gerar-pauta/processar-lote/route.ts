import { NextRequest, NextResponse } from 'next/server';
import { downloadArquivo, getAccessTokenFromRequest } from '@/lib/drive';
import { parsearTextoPortarias } from '@/lib/parser';
import type { Portaria, NaoGerado } from '@/types';

async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(req);
    const { arquivos }: { arquivos: { id: string; nome: string }[] } = await req.json();

    const portarias: Portaria[] = [];
    const naoGerados: NaoGerado[] = [];
    const processados = new Set<string>();

    for (const fi of arquivos) {
      const nome = fi.nome;
      if (processados.has(nome)) {
        naoGerados.push({ nome, motivo: 'Arquivo duplicado.' });
        continue;
      }
      processados.add(nome);

      try {
        const buffer = await downloadArquivo(accessToken, fi.id);
        let conteudo: string;

        if (nome.toLowerCase().endsWith('.doc')) {
          try {
            conteudo = await extractDocxText(buffer);
          } catch {
            naoGerados.push({ nome, motivo: 'Arquivo .doc legado não suportado. Converta para .docx.' });
            continue;
          }
        } else {
          conteudo = await extractDocxText(buffer);
        }

        if (!conteudo || conteudo.trim() === '') {
          naoGerados.push({ nome, motivo: 'Erro ao extrair texto ou conteúdo vazio.' });
          continue;
        }

        const parsed = parsearTextoPortarias(conteudo, nome);
        for (const p of parsed) {
          if (
            p.numeroOriginal === 'Nº desconhecido' &&
            p.data === 'Data desconhecida.' &&
            p.conteudo === 'Conteúdo não encontrado.'
          ) {
            naoGerados.push({ nome, motivo: 'Portaria sem número, data ou conteúdo válido.' });
          } else {
            portarias.push(p);
          }
        }
      } catch (err: any) {
        naoGerados.push({ nome, motivo: `Erro ao processar: ${err.message}` });
      }
    }

    return NextResponse.json({ portarias, naoGerados });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
