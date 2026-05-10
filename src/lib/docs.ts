import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
} from 'docx';
import type { Portaria } from '@/types';

export function gerarDocxBuffer(portarias: Portaria[]): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Cabeçalho
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'O Desembargador Roberto Gonçalves de Moura, Presidente do Tribunal de Justiça do Estado do Pará, no uso de suas atribuições legais, RESOLVE:',
          bold: true,
          size: 24, // 12pt
          font: 'Arial',
        }),
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 },
    })
  );

  for (const portaria of portarias) {
    // Cabeçalho da portaria
    const cabecalhoRuns: TextRun[] = [];
    const cabecalho = `PORTARIA Nº ${portaria.numeroOriginal}. ${portaria.data}${portaria.republicacao}`;

    cabecalhoRuns.push(
      new TextRun({
        text: cabecalho,
        bold: true,
        size: 24,
        font: 'Arial',
        highlight: portaria.numeroOriginal === 'Nº desconhecido' || portaria.duplicada || portaria.data === 'Data desconhecida.' ? 'yellow' : undefined,
      })
    );

    children.push(
      new Paragraph({
        children: cabecalhoRuns,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 60 },
      })
    );

    // Considerando
    if (portaria.considerando) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: portaria.considerando,
              size: 24,
              font: 'Arial',
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 60 },
        })
      );
    }

    // Conteúdo
    const conteudo = portaria.conteudo || 'Conteúdo não encontrado.';
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: conteudo,
            size: 24,
            font: 'Arial',
            highlight: conteudo === 'Conteúdo não encontrado.' ? 'yellow' : undefined,
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
