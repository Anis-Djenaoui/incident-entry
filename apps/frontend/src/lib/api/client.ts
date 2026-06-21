import axios from 'axios';

/**
 * Sous-chemin de montage de l'application (ex: `/request-buat`).
 * Next.js ne préfixe pas automatiquement les appels fetch/axios bruts : on
 * l'ajoute donc manuellement côté navigateur.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * En navigateur : requêtes same-origin préfixées par le basePath, relayées par
 * la route proxy Next.js (`/<basePath>/api/*`).
 * Côté serveur (SSR / route handler) : accès direct au backend.
 */
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return BASE_PATH;
  }
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

/**
 * Client Axios unique de l'application.
 *
 * `withCredentials: true` garantit l'envoi automatique du cookie de session
 * HttpOnly `app_session` sur chaque requête.
 */
export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getApiBaseUrl = (): string => getBaseUrl();

const isAuthEndpoint = (url?: string): boolean => !!url && url.includes('/api/auth/');

const loginPath = `${BASE_PATH}/login`;

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url as string | undefined;

    if (
      status === 401 &&
      !isAuthEndpoint(requestUrl) &&
      typeof window !== 'undefined' &&
      window.location.pathname !== loginPath
    ) {
      window.location.assign(loginPath);
    }

    return Promise.reject(error);
  },
);
