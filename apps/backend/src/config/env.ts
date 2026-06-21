import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Variable d'environnement manquante: ${key}`);
  }
  return value;
};

const optionalEnv = (key: string, fallback: string): string => {
  const value = process.env[key];
  return value && value.trim() !== '' ? value : fallback;
};

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: requireEnv('DATABASE_URL'),

  documentStoragePath: optionalEnv('DOCUMENT_STORAGE_PATH', 'storage/generated-documents'),
  docxTemplatePath: optionalEnv('DOCX_TEMPLATE_PATH', 'templates/incident-template.docx'),

  alfresco: {
    baseUrl: requireEnv('ALFRESCO_BASE_URL').replace(/\/+$/, ''),
  },

  session: {
    encryptionKey: requireEnv('SESSION_ENCRYPTION_KEY'),
    cookieName: optionalEnv('SESSION_COOKIE_NAME', 'app_session'),
    durationHours: parseInt(optionalEnv('SESSION_DURATION_HOURS', '8'), 10),
    // En production HTTPS : true. Docker HTTP local : définir false explicitement.
    cookieSecure: optionalEnv('SESSION_COOKIE_SECURE', isProduction ? 'true' : 'false') === 'true',
  },

  cors: {
    origin: requireEnv('CORS_ORIGIN'),
  },

  logLevel: optionalEnv('LOG_LEVEL', isProduction ? 'info' : 'debug'),
} as const;

export const resolveFromRoot = (relativePath: string): string =>
  path.resolve(process.cwd(), relativePath);
