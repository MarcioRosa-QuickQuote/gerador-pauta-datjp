export interface AppSession {
  accessToken?: string | null;
  refreshToken?: string | null;
  portariasFolderId?: string | null;
  pautasFolderId?: string | null;
  sgpFolderId?: string | null;
  user?: { name?: string | null; email?: string | null; image?: string | null };
}
