import rateLimit from 'express-rate-limit';

/**
 * Limiteur anti brute-force pour l'endpoint de connexion.
 * 5 tentatives par IP sur une fenêtre de 15 minutes, sinon 429.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.' },
});
