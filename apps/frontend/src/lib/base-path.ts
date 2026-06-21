/**
 * Préfixe de montage de l'application (ex: `/request-buat`).
 * Doit correspondre à NEXT_PUBLIC_BASE_PATH au build.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Préfixe un chemin absolu avec le basePath (assets publics, etc.). */
export const withBasePath = (pathname: string): string =>
  `${BASE_PATH}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
