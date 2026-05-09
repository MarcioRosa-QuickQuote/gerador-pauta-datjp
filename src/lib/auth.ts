import type { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { google } from 'googleapis';

const FOLDER_NAMES = {
  portarias: 'DATJP - Portarias',
  pautas: 'DATJP - Pautas',
  sgp: 'DATJP - SGP',
};

async function createDriveFolder(accessToken: string, name: string): Promise<string> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const res = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder' },
    fields: 'id',
  });
  return res.data.id!;
}

async function findOrCreateFolders(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  async function findFolder(name: string): Promise<string | null> {
    const res = await drive.files.list({
      q: `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id)',
      pageSize: 1,
    });
    return res.data.files?.[0]?.id || null;
  }

  let portariasFolderId = await findFolder(FOLDER_NAMES.portarias);
  if (!portariasFolderId) portariasFolderId = await createDriveFolder(accessToken, FOLDER_NAMES.portarias);

  let pautasFolderId = await findFolder(FOLDER_NAMES.pautas);
  if (!pautasFolderId) pautasFolderId = await createDriveFolder(accessToken, FOLDER_NAMES.pautas);

  let sgpFolderId = await findFolder(FOLDER_NAMES.sgp);
  if (!sgpFolderId) sgpFolderId = await createDriveFolder(accessToken, FOLDER_NAMES.sgp);

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
        } catch (err) {
          console.error('Erro ao configurar pastas:', err);
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
