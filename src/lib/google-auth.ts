import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getSessionOrThrow() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error('Não autenticado');
  }
  return session;
}

export async function driveFetch(accessToken: string, path: string, options: RequestInit = {}) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive API error ${res.status}: ${text}`);
  }
  return res;
}
