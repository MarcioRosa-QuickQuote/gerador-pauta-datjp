import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permite rotas de auth, assets e api/auth
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Protege API routes
  if (pathname.startsWith('/api/')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-access-token', token.accessToken as string);
    requestHeaders.set('x-portarias-folder-id', (token.portariasFolderId as string) || '');
    requestHeaders.set('x-pautas-folder-id', (token.pautasFolderId as string) || '');
    requestHeaders.set('x-sgp-folder-id', (token.sgpFolderId as string) || '');
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
