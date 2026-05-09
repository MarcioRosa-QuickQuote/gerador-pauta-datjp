import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getServerAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error('Não autenticado');
  }
  return session.accessToken;
}

export function getOAuth2Client(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

export function getDriveClientForUser(accessToken: string) {
  return google.drive({ version: 'v3', auth: getOAuth2Client(accessToken) });
}

export function getDocsClientForUser(accessToken: string) {
  return google.docs({ version: 'v1', auth: getOAuth2Client(accessToken) });
}
