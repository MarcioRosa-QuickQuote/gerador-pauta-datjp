import { getDriveClientForUser } from './google-auth';
import type { drive_v3 } from 'googleapis';

export async function listarArquivosDaPasta(
  accessToken: string,
  folderId: string
): Promise<drive_v3.Schema$File[]> {
  const drive = getDriveClientForUser(accessToken);
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, createdTime, mimeType)',
    orderBy: 'name',
    pageSize: 1000,
  });
  return res.data.files || [];
}

/** Verifica se arquivo com mesmo nome já existe na pasta */
export async function existeArquivoComNome(
  accessToken: string,
  folderId: string,
  nome: string
): Promise<boolean> {
  const drive = getDriveClientForUser(accessToken);
  const escaped = nome.replace(/'/g, "\\'");
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name = '${escaped}' and trashed = false`,
    fields: 'files(id)',
  });
  return (res.data.files || []).length > 0;
}

/** Upload de arquivo para o Drive */
export async function uploadArquivo(
  accessToken: string,
  nome: string,
  buffer: Buffer,
  mimeType: string,
  folderId: string
): Promise<string> {
  const drive = getDriveClientForUser(accessToken);
  const stream = require('stream');
  const res = await drive.files.create({
    requestBody: {
      name: nome,
      parents: [folderId],
      mimeType,
    },
    media: {
      mimeType,
      body: stream.Readable.from(buffer),
    },
  });
  return res.data.id!;
}

/** Download de arquivo do Drive como Buffer */
export async function downloadArquivo(accessToken: string, fileId: string): Promise<Buffer> {
  const drive = getDriveClientForUser(accessToken);
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data as ArrayBuffer);
}

/** Apagar arquivo (mover para lixeira) */
export async function apagarArquivo(accessToken: string, fileId: string): Promise<void> {
  const drive = getDriveClientForUser(accessToken);
  await drive.files.update({ fileId, requestBody: { trashed: true } });
}

/** Adicionar permissão pública (anyone leitor) */
export async function tornarPublico(accessToken: string, fileId: string): Promise<void> {
  const drive = getDriveClientForUser(accessToken);
  await drive.permissions.create({
    fileId,
    requestBody: { type: 'anyone', role: 'reader' },
  });
}

/** Mover arquivo para uma pasta */
export async function moverParaPasta(
  accessToken: string,
  fileId: string,
  folderId: string
): Promise<void> {
  const drive = getDriveClientForUser(accessToken);
  const file = await drive.files.get({ fileId, fields: 'parents' });
  const previousParents = (file.data.parents || []).join(',');
  await drive.files.update({
    fileId,
    addParents: folderId,
    removeParents: previousParents,
    fields: 'id, parents',
  });
}

/** Extrai folder IDs do request (injetados pelo middleware) */
export function getFolderIdsFromRequest(req: Request) {
  return {
    portarias: req.headers.get('x-portarias-folder-id') || '',
    pautas: req.headers.get('x-pautas-folder-id') || '',
    sgp: req.headers.get('x-sgp-folder-id') || '',
  };
}

/** Extrai access token do request */
export function getAccessTokenFromRequest(req: Request): string {
  const token = req.headers.get('x-access-token');
  if (!token) throw new Error('Token de acesso não encontrado');
  return token;
}
