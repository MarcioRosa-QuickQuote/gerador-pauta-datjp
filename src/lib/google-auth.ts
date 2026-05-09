import { google } from 'googleapis';
import type { JWT } from 'google-auth-library';

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/documents',
];

function getServiceAccountKey() {
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!encoded) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not set');
  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
}

function getAuth(): JWT {
  const key = getServiceAccountKey();
  return new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: SCOPES,
  });
}

export function getDriveClient() {
  return google.drive({ version: 'v3', auth: getAuth() });
}

export function getDocsClient() {
  return google.docs({ version: 'v1', auth: getAuth() });
}
