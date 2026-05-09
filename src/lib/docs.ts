import { getDocsClient } from './google-auth';
import { tornarPublico, moverParaPasta, getPautasFolderId } from './drive';
import type { Portaria } from '@/types';

/** Cria um Google Doc vazio e retorna o ID */
export async function criarDocPauta(titulo: string): Promise<string> {
  const docs = getDocsClient();
  const res = await docs.documents.create({
    requestBody: { title: titulo },
  });
  const docId = res.data.documentId!;

  await tornarPublico(docId);
  await moverParaPasta(docId, getPautasFolderId());

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
            range: {
              startIndex: 1,
              endIndex: 140, // aproximadamente o tamanho do cabeçalho
            },
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
export async function escreverPortarias(docId: string, portarias: Portaria[]): Promise<void> {
  const docs = getDocsClient();

  // Primeiro, obtém o tamanho atual do documento
  const doc = await docs.documents.get({ documentId: docId });
  let currentIndex = doc.data.body?.content?.reduce(
    (max, el) => {
      const end = (el.endIndex || 0);
      return end > max ? end : max;
    },
    1
  ) || 1;

  const requests: any[] = [];

  for (const portaria of portarias) {
    const cabecalho = `PORTARIA Nº ${portaria.numeroOriginal}. ${portaria.data}${portaria.republicacao}`;

    // Insere cabeçalho
    const cabStart = currentIndex;
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: cabecalho + '\n',
      },
    });
    // +1 por causa do \n final
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

    // Destaque: número desconhecido
    if (portaria.numeroOriginal === 'Nº desconhecido') {
      const idx = cabecalho.indexOf('Nº desconhecido');
      if (idx !== -1) {
        requests.push({
          updateTextStyle: {
            range: {
              startIndex: cabStart + idx,
              endIndex: cabStart + idx + 'Nº desconhecido'.length,
            },
            textStyle: { backgroundColor: { color: { rgbColor: { rgbColor: { red: 1, green: 1, blue: 0 } } } } },
            fields: 'backgroundColor',
          },
        });
      }
    }

    // Destaque: duplicada
    if (portaria.duplicada) {
      const tag = `PORTARIA Nº ${portaria.numeroOriginal}`;
      const idx = cabecalho.indexOf(tag);
      if (idx !== -1) {
        requests.push({
          updateTextStyle: {
            range: {
              startIndex: cabStart + idx,
              endIndex: cabStart + idx + tag.length,
            },
            textStyle: { backgroundColor: { color: { rgbColor: { rgbColor: { red: 1, green: 1, blue: 0 } } } } },
            fields: 'backgroundColor',
          },
        });
      }
    }

    // Destaque: data desconhecida
    if (portaria.data === 'Data desconhecida.') {
      const idx = cabecalho.indexOf('Data desconhecida.');
      if (idx !== -1) {
        requests.push({
          updateTextStyle: {
            range: {
              startIndex: cabStart + idx,
              endIndex: cabStart + idx + 'Data desconhecida.'.length,
            },
            textStyle: { backgroundColor: { color: { rgbColor: { rgbColor: { red: 1, green: 1, blue: 0 } } } } },
            fields: 'backgroundColor',
          },
        });
      }
    }

    currentIndex = cabEnd + 1; // depois de \n

    // Considerando
    if (portaria.considerando) {
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: portaria.considerando + '\n',
        },
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

    // Conteúdo (RESOLVE)
    const conteudo = portaria.conteudo || 'Conteúdo não encontrado.';
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: conteudo + '\n',
      },
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
            range: {
              startIndex: currentIndex + idx,
              endIndex: currentIndex + idx + 'Conteúdo não encontrado.'.length,
            },
            textStyle: { backgroundColor: { color: { rgbColor: { rgbColor: { red: 1, green: 1, blue: 0 } } } } },
            fields: 'backgroundColor',
          },
        });
      }
    }

    currentIndex = contEnd + 1;

    // Espaço entre portarias
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: '\n',
      },
    });
    currentIndex += 1;
  }

  // Batch de no máximo 100 requests por chamada
  for (let i = 0; i < requests.length; i += 100) {
    const batch = requests.slice(i, i + 100);
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests: batch },
    });
  }
}

/** Obtém o texto de um Google Doc */
export async function obterTextoDoc(docId: string): Promise<string> {
  const docs = getDocsClient();
  const res = await docs.documents.get({ documentId: docId });
  const body = res.data.body?.content || [];
  let texto = '';
  for (const el of body) {
    if (el.paragraph) {
      for (const pe of el.paragraph.elements || []) {
        if (pe.textRun?.content) {
          texto += pe.textRun.content;
        }
      }
    }
  }
  return texto;
}
