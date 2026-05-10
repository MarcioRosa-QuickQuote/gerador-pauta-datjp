export interface Portaria {
  numeroOriginal: string;
  data: string;
  republicacao: string;
  considerando: string;
  conteudo: string;
  duplicada: boolean;
  nomeArquivo?: string;
}

export interface ArquivoInfo {
  id: string;
  nome: string;
}

export interface NaoGerado {
  nome: string;
  motivo: string;
}

export interface ResultadoUpload {
  status: 'success' | 'duplicate';
}

export interface ResultadoIniciar {
  docId: string;
  fileInfos: ArquivoInfo[];
  sgpFileId: string | null;
  titulo: string;
  pautasFolderId: string;
}

export interface ResultadoLote {
  portarias: Portaria[];
  naoGerados: NaoGerado[];
}

export interface ResultadoFinalizar {
  url: string;
  naoGerados: NaoGerado[];
}
