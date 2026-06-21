import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Gestionnaire d'erreurs global.
 *
 * - Les `AppError` (erreurs métier maîtrisées) exposent leur message et leur
 *   statut.
 * - Toute autre erreur est journalisée côté serveur uniquement ; le client ne
 *   reçoit qu'un message générique, sans stack trace, message technique ni
 *   erreur SQL.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  logger.error(
    { err, method: req.method, path: req.path },
    'Erreur inattendue',
  );
  res.status(500).json({ message: 'Une erreur est survenue' });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Route non trouvée' });
};
