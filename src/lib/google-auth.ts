import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import type { AppSession } from '@/types/session';

export async function getSessionOrThrow(): Promise<AppSession> {
  const session = (await getServerSession(authOptions)) as AppSession;
  if (!session?.accessToken) throw new Error('Não autenticado');

  if (session.refreshToken && isTokenExpired(session.accessToken)) {
    try {
      const newToken = await refreshAccessToken(session.refreshToken);
      session.accessToken = newToken;
    } catch { /* usa token existente */ }
  }

  return session;
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.exp * 1000 < Date.now() + 60000;
  } catch {
    return false;
  }
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

export async function driveFetch(accessToken: string, path: string, options: RequestInit = {}) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken}`, ...options.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive API error ${res.status}: ${text}`);
  }
  return res;
}
