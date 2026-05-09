import type { Portaria } from '@/types';

function parsearBlocoPortaria(portariaTexto: string, nomeArquivo: string): Portaria | null {
  portariaTexto = portariaTexto.replace(/\n{2,}/g, '\n').trim();

  const paragrafos = portariaTexto.split('\n').filter((p) => {
    return !p.trim().match(/^(A\s+(Desembargadora|Excelentíssimo\s+Senhor).+no uso de suas atribuições legais,?)/i);
  });
  portariaTexto = paragrafos.join('\n').trim();

  if (!portariaTexto) return null;

  const regexPortaria = /(?:PORTARIA|P\s*O\s*R\s*T\s*A\s*R\s*I\s*A)\s*N\.?[ºo°]?\s*(\d{1,5})\s*[/-]?\s*(\d{4})/i;
  const numeroMatch = portariaTexto.match(regexPortaria);
  let numeroPortaria = numeroMatch ? `${numeroMatch[1]}/${numeroMatch[2]}-GP` : 'Nº desconhecido';

  if (numeroPortaria === 'Nº desconhecido') {
    const numAlternativo = portariaTexto.match(/\b(\d{1,5})\s*[/-]?\s*(\d{4})\b/);
    if (numAlternativo) {
      numeroPortaria = `${numAlternativo[1]}/${numAlternativo[2]}-GP`;
    }
  }

  const dataMatch = portariaTexto.match(/Belém,\s*(\d{1,2})\s*de\s*([a-zçãéíõú]+)\s*de\s*(\d{4})/i);
  const dataPortaria = dataMatch
    ? `Belém, ${dataMatch[1]} de ${dataMatch[2]} de ${dataMatch[3]}.`
    : 'Data desconhecida.';

  const republicacao = portariaTexto.match(/\*Republicado por retificação/i)
    ? ' *Republicado por retificação.'
    : '';

  const considerandoMatch = portariaTexto.match(/^(Considerando[\s\S]*?)(?=R\s*E\s*S\s*O\s*L\s*V\s*E)/im);
  const considerando = considerandoMatch ? considerandoMatch[0].trim() : '';

  const conteudoMatch = portariaTexto.match(/R\s*E\s*S\s*O\s*L\s*V\s*E[:]*\s*([\s\S]*?)\s*Publique-se[.]?/i);
  const conteudo = conteudoMatch ? conteudoMatch[1].trim() : portariaTexto.trim();

  return {
    numeroOriginal: numeroPortaria,
    data: dataPortaria,
    republicacao,
    considerando,
    conteudo: conteudo || 'Conteúdo não encontrado.',
    duplicada: false,
    nomeArquivo,
  };
}

export function parsearTextoPortarias(texto: string, nomeArquivo: string): Portaria[] {
  const limpo = texto.replace(/\n+/g, '\n').trim();
  const blocos = limpo
    .split(/(?=^(?:PORTARIA|P\s*O\s*R\s*T\s*A\s*R\s*I\s*A)\s*N\.?[ºo°]?\s*\d+\/\d{4})/im)
    .filter((b) => b.trim().length > 0);

  const portarias: Portaria[] = [];
  for (const bloco of blocos) {
    const p = parsearBlocoPortaria(bloco, nomeArquivo);
    if (p) portarias.push(p);
  }
  return portarias;
}

export function removerCabecalhoSGP(texto: string): string {
  return texto.replace(
    /SECRETARIA DE GESTÃO DE PESSOAS\s*\n\s*O Desembargador Roberto Gonçalves de Moura, Presidente do Tribunal de Justiça do Estado do Pará, no uso de suas atribuições legais, RESOLVE:/i,
    ''
  );
}
