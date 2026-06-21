import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { clearSessionCookie } from '../utils/cookie';

/**
 * Crée le middleware d'authentification.
 *
 * Workflow :
 *   1. lire le cookie de session
 *   2. calculer le SHA-256 (réalisé par le SessionService)
 *   3. rechercher la session
 *   4. vérifier l'expiration
 *   5. vérifier la révocation et l'inactivité (8h)
 *   6. mettre à jour `last_activity` et injecter l'utilisateur dans `req.user`
 *
 * En cas de session invalide/expirée : le cookie est supprimé et un 401 est
 * renvoyé.
 */
export const createAuthMiddleware = (sessionService: SessionService) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.[config.session.cookieName];

    if (!token || typeof token !== 'string') {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    try {
      const result = await sessionService.validateToken(token);

      if (!result) {
        clearSessionCookie(res);
        logger.info({ ip: req.ip }, 'Session expirée ou invalide');
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      req.user = result.user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
