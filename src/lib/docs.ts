import { getDocsClientForUser } from './google-auth';
import { tornarPublico, moverParaPasta } from './drive';
import type { Portaria } from '@/types';

/** Cria um Google Doc vazio e retorna o ID */
export async function criarDocPauta(
  accessToken: string,
  titulo: string,
  pautasFolderId: string
): Promise<string> {
  const docs = getDocsClientForUser(accessToken);
  const res = await docs.documents.create({
    requestBody: { title: titulo },
  });
  const docId = res.data.documentId!;

  await tornarPublico(accessToken, docId);
  await moverParaPasta(accessToken, docId, pautasFolderId);

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
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
    },
  });

  return docId;
}

/** Escreve as portarias no documento via batchUpdate */
export async function escreverPortarias(
  accessToken: string,
  docId: string,
  portarias: Portaria[]
): Promise<void> {
  const docs = getDocsClientForUser(accessToken);

  const doc = await docs.documents.get({ documentId: docId });
  let currentIndex =
    doc.data.body?.content?.reduce((max, el) => {
      const end = el.endIndex || 0;
      return end > max ? end : max;
    }, 1) || 1;

  const requests: any[] = [];

  for (const portaria of portarias) {
    const cabecalho = `PORTARIA Nº ${portaria.numeroOriginal}. ${portaria.data}${portaria.republicacao}`;
    const cabStart = currentIndex;

    requests.push({
      insertText: { location: { index: currentIndex }, text: cabecalho + '\n' },
    });
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

    const yellowBg = {
      backgroundColor: {
        color: { rgbColor: { rgbColor: { red: 1, green: 1, blue: 0 } } },
      },
    };

    // Destaques amarelos
    if (portaria.numeroOriginal === 'Nº desconhecido') {
      const idx = cabecalho.indexOf('Nº desconhecido');
      if (idx !== -1) {
        requests.push({
          updateTextStyle: {
            range: { startIndex: cabStart + idx, endIndex: cabStart + idx + 14 },
            textStyle: yellowBg,
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
            textStyle: yellowBg,
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
            textStyle: yellowBg,
            fields: 'backgroundColor',
          },
        });
      }
    }

    currentIndex = cabEnd + 1;

    if (portaria.considerando) {
      requests.push({
        insertText: { location: { index: currentIndex }, text: portaria.considerando + '\n' },
      });
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
    requests.push({
      insertText: { location: { index: currentIndex }, text: conteudo + '\n' },
    });
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
            textStyle: yellowBg,
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
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests: batch },
    });
  }
}

/** Obtém o texto de um Google Doc */
export async function obterTextoDoc(accessToken: string, docId: string): Promise<string> {
  const docs = getDocsClientForUser(accessToken);
  const res = await docs.documents.get({ documentId: docId });
  const body = res.data.body?.content || [];
  let texto = '';
  for (const el of body) {
    if (el.paragraph) {
      for (const pe of el.paragraph.elements || []) {
        if (pe.textRun?.content) texto += pe.textRun.content;
      }
    }
  }
  return texto;
}
