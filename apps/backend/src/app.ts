import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { config } from './config/env';
import { logger } from './config/logger';
import dossierRoutes from './routes/dossier.routes';
import { authRoutes, authMiddleware } from './routes/auth.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app = express();

// Nécessaire derrière Nginx : respecte X-Forwarded-Proto / X-Forwarded-For
// (cookies Secure, req.ip, rate-limiting par IP réelle).
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'no-referrer' },
    hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  }),
);

app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);

app.use(pinoHttp({ logger }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

// Routes métier protégées : authentification requise.
app.use('/api', authMiddleware, dossierRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
