import type { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const FOLDER_NAMES = {
  portarias: 'DATJP - Portarias',
  pautas: 'DATJP - Pautas',
  sgp: 'DATJP - SGP',
};

async function driveApiCall(accessToken: string, path: string, options: RequestInit = {}) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function findOrCreateFolders(accessToken: string) {
  async function findFolder(name: string): Promise<string | null> {
    const q = encodeURIComponent(
      `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );
    const data = await driveApiCall(accessToken, `files?q=${q}&fields=files(id)&pageSize=1`);
    return data.files?.[0]?.id || null;
  }

  async function createFolder(name: string): Promise<string> {
    const data = await driveApiCall(accessToken, 'files', {
      method: 'POST',
      body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' }),
    });
    return data.id;
  }

  let portariasFolderId = await findFolder(FOLDER_NAMES.portarias);
  if (!portariasFolderId) portariasFolderId = await createFolder(FOLDER_NAMES.portarias);

  let pautasFolderId = await findFolder(FOLDER_NAMES.pautas);
  if (!pautasFolderId) pautasFolderId = await createFolder(FOLDER_NAMES.pautas);

  let sgpFolderId = await findFolder(FOLDER_NAMES.sgp);
  if (!sgpFolderId) sgpFolderId = await createFolder(FOLDER_NAMES.sgp);

  return { portariasFolderId, pautasFolderId, sgpFolderId };
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        try {
          const folders = await findOrCreateFolders(account.access_token!);
          token.portariasFolderId = folders.portariasFolderId;
          token.pautasFolderId = folders.pautasFolderId;
          token.sgpFolderId = folders.sgpFolderId;
        } catch (err: any) {
          console.error('Erro ao configurar pastas:', err?.message || err);
          // Não quebra o login se falhar — usuário loga e pastas são criadas depois
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        portariasFolderId: token.portariasFolderId,
        pautasFolderId: token.pautasFolderId,
        sgpFolderId: token.sgpFolderId,
      };
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};
