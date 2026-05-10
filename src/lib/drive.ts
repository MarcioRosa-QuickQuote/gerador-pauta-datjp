import { driveFetch } from './google-auth';

export async function listarArquivosDaPasta(
  accessToken: string,
  folderId: string
): Promise<{ id: string; name: string; createdTime: string; mimeType: string }[]> {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const res = await driveFetch(accessToken, `files?q=${q}&fields=files(id,name,createdTime,mimeType)&orderBy=name&pageSize=1000`);
  const data = await res.json();
  return data.files || [];
}

export async function existeArquivoComNome(
  accessToken: string,
  folderId: string,
  nome: string
): Promise<boolean> {
  const escaped = nome.replace(/'/g, "\\'");
  const q = encodeURIComponent(`'${folderId}' in parents and name = '${escaped}' and trashed = false`);
  const res = await driveFetch(accessToken, `files?q=${q}&fields=files(id)`);
  const data = await res.json();
  return (data.files || []).length > 0;
}

export async function uploadArquivo(
  accessToken: string,
  nome: string,
  buffer: Buffer,
  mimeType: string,
  folderId: string
): Promise<string> {
  const boundary = `-------${Date.now()}`;
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify({ name: nome, parents: [folderId] })}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n`),
    buffer,
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.id;
}

export async function downloadArquivo(accessToken: string, fileId: string): Promise<Buffer> {
  const res = await driveFetch(accessToken, `files/${fileId}?alt=media`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function apagarArquivo(accessToken: string, fileId: string): Promise<void> {
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trashed: true }),
  });
}

export async function tornarPublico(accessToken: string, fileId: string): Promise<void> {
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'anyone', role: 'reader' }),
  });
}

export async function moverParaPasta(
  accessToken: string,
  fileId: string,
  folderId: string
): Promise<void> {
  const fileRes = await driveFetch(accessToken, `files/${fileId}?fields=parents`);
  const fileData = await fileRes.json();
  const previousParents = (fileData.parents || []).join(',');

  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${folderId}&removeParents=${previousParents}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function getFolderIdsFromRequest(req: Request) {
  return {
    portarias: req.headers.get('x-portarias-folder-id') || '',
    pautas: req.headers.get('x-pautas-folder-id') || '',
    sgp: req.headers.get('x-sgp-folder-id') || '',
  };
}

export function getAccessTokenFromRequest(req: Request): string {
  const token = req.headers.get('x-access-token');
  if (!token) throw new Error('Token de acesso não encontrado');
  return token;
}
