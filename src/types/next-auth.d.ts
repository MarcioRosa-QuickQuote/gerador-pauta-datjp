import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    portariasFolderId?: string;
    pautasFolderId?: string;
    sgpFolderId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    portariasFolderId?: string;
    pautasFolderId?: string;
    sgpFolderId?: string;
  }
}
