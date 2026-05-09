import { NextRequest, NextResponse } from 'next/server';
import { downloadArquivo } from '@/lib/drive';
import { parsearTextoPortarias } from '@/lib/parser';
import type { Portaria, NaoGerado } from '@/types';

// Extensão dinâmica para importar mammoth como ESM no serverless
async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function POST(req: NextRequest) {
  try {
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
        const buffer = await downloadArquivo(fi.id);

        let conteudo: string;
        if (nome.toLowerCase().endsWith('.doc')) {
          // Tenta processar .doc como docx (muitos .doc modernos são docx na verdade)
          try {
            conteudo = await extractDocxText(buffer);
          } catch {
            // Serviço externo necessário para .doc legado
            const response = await fetch(`https://docs.google.com/viewer?url=&embedded=true`, {
              // Google Docs Viewer não funciona para upload direto
            });
            // Fallback: não suportado
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
