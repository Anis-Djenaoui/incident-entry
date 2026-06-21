import axios from 'axios';

/**
 * En navigateur : requêtes same-origin via les rewrites Next.js (`/api/*`).
 * Côté serveur (SSR) : accès direct au backend.
 */
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return '';
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url as string | undefined;

    if (
      status === 401 &&
      !isAuthEndpoint(requestUrl) &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/login'
    ) {
      window.location.assign('/login');
    }

    return Promise.reject(error);
  },
);
