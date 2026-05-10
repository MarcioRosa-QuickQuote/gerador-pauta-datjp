import { docsFetch } from './google-auth';
import { tornarPublico, moverParaPasta } from './drive';
import type { Portaria } from '@/types';

const YELLOW_BG = {
  color: { rgbColor: { red: 1, green: 1, blue: 0 } },
};

export async function criarDocPauta(
  accessToken: string,
  titulo: string,
  pautasFolderId: string
): Promise<string> {
  const res = await docsFetch(accessToken, 'documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: titulo }),
  });
  const data = await res.json();
  const docId = data.documentId;

  await tornarPublico(accessToken, docId);
  await moverParaPasta(accessToken, docId, pautasFolderId);

  // Escreve cabeçalho
  await docsFetch(accessToken, `documents/${docId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: 'O Desembargador Roberto Gonçalves de Moura, Presidente do Tribunal de Justiça do Estado do Pará, no uso de suas atribuições legais, RESOLVE:\n\n',
          },
        },
        {
          updateParagraphStyle: {
            range: { startIndex: 1, endIndex: 2 },
            paragraphStyle: { alignment: 'JUSTIFIED' },
            fields: 'alignment',
          },
        },
        {
          updateTextStyle: {
            range: { startIndex: 1, endIndex: 140 },
            textStyle: { bold: true },
            fields: 'bold',
          },
        },
      ],
    }),
  });

  return docId;
}

export async function escreverPortarias(
  accessToken: string,
  docId: string,
  portarias: Portaria[]
): Promise<void> {
  const getRes = await docsFetch(accessToken, `documents/${docId}`);
  const doc = await getRes.json();
  let currentIndex =
    (doc.body?.content || []).reduce((max: number, el: any) => {
      const end = el.endIndex || 0;
      return end > max ? end : max;
    }, 1) || 1;

  const requests: any[] = [];

  for (const portaria of portarias) {
    const cabecalho = `PORTARIA Nº ${portaria.numeroOriginal}. ${portaria.data}${portaria.republicacao}`;
    const cabStart = currentIndex;

    requests.push({ insertText: { location: { index: currentIndex }, text: cabecalho + '\n' } });
    const cabEnd = currentIndex + cabecalho.length;

    requests.push({
      updateParagraphStyle: {
        range: { startIndex: cabStart, endIndex: cabEnd + 1 },
        paragraphStyle: { alignment: 'JUSTIFIED' },
        fields: 'alignment',
      },
    });
    requests.push({
      updateTextStyle: {
        range: { startIndex: cabStart, endIndex: cabEnd },
        textStyle: { bold: true },
        fields: 'bold',
      },
    });

    if (portaria.numeroOriginal === 'Nº desconhecido') {
      const idx = cabecalho.indexOf('Nº desconhecido');
      if (idx !== -1) {
        requests.push({
          updateTextStyle: {
            range: { startIndex: cabStart + idx, endIndex: cabStart + idx + 14 },
            textStyle: { backgroundColor: YELLOW_BG },
            fields: 'backgroundColor',
          },
        });
      }
    }

    if (portaria.duplicada) {
      const tag = `PORTARIA Nº ${portaria.numeroOriginal}`;
      const idx = cabecalho.indexOf(tag);
      if (idx !== -1) {
        requests.push({
          updateTextStyle: {
            range: { startIndex: cabStart + idx, endIndex: cabStart + idx + tag.length },
            textStyle: { backgroundColor: YELLOW_BG },
            fields: 'backgroundColor',
          },
        });
      }
    }

    if (portaria.data === 'Data desconhecida.') {
      const idx = cabecalho.indexOf('Data desconhecida.');
      if (idx !== -1) {
        requests.push({
          updateTextStyle: {
            range: { startIndex: cabStart + idx, endIndex: cabStart + idx + 17 },
            textStyle: { backgroundColor: YELLOW_BG },
            fields: 'backgroundColor',
          },
        });
      }
    }

    currentIndex = cabEnd + 1;

    if (portaria.considerando) {
      requests.push({ insertText: { location: { index: currentIndex }, text: portaria.considerando + '\n' } });
      const consEnd = currentIndex + portaria.considerando.length;
      requests.push({
        updateParagraphStyle: {
          range: { startIndex: currentIndex, endIndex: consEnd + 1 },
          paragraphStyle: { alignment: 'JUSTIFIED' },
          fields: 'alignment',
        },
      });
      currentIndex = consEnd + 1;
    }

    const conteudo = portaria.conteudo || 'Conteúdo não encontrado.';
    requests.push({ insertText: { location: { index: currentIndex }, text: conteudo + '\n' } });
    const contEnd = currentIndex + conteudo.length;
    requests.push({
      updateParagraphStyle: {
        range: { startIndex: currentIndex, endIndex: contEnd + 1 },
        paragraphStyle: { alignment: 'JUSTIFIED' },
        fields: 'alignment',
      },
    });

    if (conteudo === 'Conteúdo não encontrado.') {
      const idx = conteudo.indexOf('Conteúdo não encontrado.');
      if (idx !== -1) {
        requests.push({
          updateTextStyle: {
            range: { startIndex: currentIndex + idx, endIndex: currentIndex + idx + 22 },
            textStyle: { backgroundColor: YELLOW_BG },
            fields: 'backgroundColor',
          },
        });
      }
    }

    currentIndex = contEnd + 1;
    requests.push({ insertText: { location: { index: currentIndex }, text: '\n' } });
    currentIndex += 1;
  }

  for (let i = 0; i < requests.length; i += 100) {
    const batch = requests.slice(i, i + 100);
    await docsFetch(accessToken, `documents/${docId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({ requests: batch }),
    });
  }
}

export async function obterTextoDoc(accessToken: string, docId: string): Promise<string> {
  const res = await docsFetch(accessToken, `documents/${docId}`);
  const doc = await res.json();
  let texto = '';
  for (const el of doc.body?.content || []) {
    if (el.paragraph) {
      for (const pe of el.paragraph.elements || []) {
        if (pe.textRun?.content) texto += pe.textRun.content;
      }
    }
  }
  return texto;
}
