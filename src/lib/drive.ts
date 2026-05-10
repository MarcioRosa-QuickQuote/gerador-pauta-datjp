import { driveFetch } from './google-auth';

const FOLDER_NAMES = {
  portarias: 'DATJP - Portarias',
  pautas: 'DATJP - Pautas',
  sgp: 'DATJP - SGP',
};

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
  const metadata = JSON.stringify({ name: nome, parents: [folderId] });
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    buffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) throw new Error(`Upload error ${res.status}`);
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

export async function moverParaPasta(accessToken: string, fileId: string, folderId: string): Promise<void> {
  const fileRes = await driveFetch(accessToken, `files/${fileId}?fields=parents`);
  const fileData = await fileRes.json();
  const previousParents = (fileData.parents || []).join(',');
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${folderId}&removeParents=${previousParents}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function exportarGoogleDoc(accessToken: string, fileId: string): Promise<string> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text%2Fplain`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Export error ${res.status}`);
  return res.text();
}

export async function ensureFolders(accessToken: string) {
  async function findOrCreate(name: string): Promise<string> {
    const q = encodeURIComponent(`name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    const res = await driveFetch(accessToken, `files?q=${q}&fields=files(id)&pageSize=1`);
    const data = await res.json();
    if (data.files?.[0]?.id) return data.files[0].id;

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' }),
    });
    if (!createRes.ok) throw new Error(`Falha ao criar pasta ${name}: ${createRes.status}`);
    const created = await createRes.json();
    return created.id;
  }

  const [portariasId, pautasId, sgpId] = await Promise.all([
    findOrCreate(FOLDER_NAMES.portarias),
    findOrCreate(FOLDER_NAMES.pautas),
    findOrCreate(FOLDER_NAMES.sgp),
  ]);

  return { portarias: portariasId, pautas: pautasId, sgp: sgpId };
}
