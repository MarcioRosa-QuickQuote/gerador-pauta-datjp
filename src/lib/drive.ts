import { getDriveClient } from './google-auth';
import type { drive_v3 } from 'googleapis';

const PORTARIAS_FOLDER = process.env.DRIVE_PORTARIAS_FOLDER_ID!;
const PAUTAS_FOLDER = process.env.DRIVE_PAUTAS_FOLDER_ID!;
const SGP_FOLDER = process.env.DRIVE_SGP_FOLDER_ID!;

export async function listarArquivosDaPasta(folderId: string): Promise<drive_v3.Schema$File[]> {
  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, createdTime, mimeType)',
    orderBy: 'name',
    pageSize: 1000,
  });
  return res.data.files || [];
}

/** Lista arquivos da pasta de portarias */
export async function listarPortarias() {
  return listarArquivosDaPasta(PORTARIAS_FOLDER);
}

/** Lista arquivos da pasta de pautas */
export async function listarPautasSubmetidas() {
  return listarArquivosDaPasta(PAUTAS_FOLDER);
}

/** Lista arquivos da pasta SGP */
export async function listarSGP() {
  return listarArquivosDaPasta(SGP_FOLDER);
}

/** Verifica se arquivo com mesmo nome já existe na pasta */
export async function existeArquivoComNome(folderId: string, nome: string): Promise<boolean> {
  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name = '${nome.replace(/'/g, "\\'")}' and trashed = false`,
    fields: 'files(id)',
  });
  return (res.data.files || []).length > 0;
}

/** Upload de arquivo para o Drive */
export async function uploadArquivo(
  nome: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const drive = getDriveClient();
  const res = await drive.files.create({
    requestBody: {
      name: nome,
      parents: [PORTARIAS_FOLDER],
      mimeType,
    },
    media: {
      mimeType,
      body: require('stream').Readable.from(buffer),
    },
  });
  return res.data.id!;
}

/** Download de arquivo do Drive como Buffer */
export async function downloadArquivo(fileId: string): Promise<Buffer> {
  const drive = getDriveClient();
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data as ArrayBuffer);
}

/** Apagar arquivo (mover para lixeira) */
export async function apagarArquivo(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.update({ fileId, requestBody: { trashed: true } });
}

/** Adicionar permissão pública (anyone leitor) */
export async function tornarPublico(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.permissions.create({
    fileId,
    requestBody: {
      type: 'anyone',
      role: 'reader',
    },
  });
}

/** Mover arquivo para uma pasta */
export async function moverParaPasta(fileId: string, folderId: string): Promise<void> {
  const drive = getDriveClient();
  const file = await drive.files.get({ fileId, fields: 'parents' });
  const previousParents = (file.data.parents || []).join(',');
  await drive.files.update({
    fileId,
    addParents: folderId,
    removeParents: previousParents,
    fields: 'id, parents',
  });
}

/** Pasta de portarias */
export function getPortariasFolderId() {
  return PORTARIAS_FOLDER;
}

/** Pasta de pautas */
export function getPautasFolderId() {
  return PAUTAS_FOLDER;
}

/** Pasta SGP */
export function getSGPFolderId() {
  return SGP_FOLDER;
}
