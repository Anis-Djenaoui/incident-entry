import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { logger } from '../config/logger';
import { setSessionCookie, clearSessionCookie } from '../utils/cookie';
import { LoginDto } from '../types/auth.types';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dto: LoginDto = {
      username: req.body.username,
      password: req.body.password,
    };

    try {
      const { token } = await this.authService.login(dto);
      setSessionCookie(res, token);

      logger.info({ username: dto.username, ip: req.ip }, 'Connexion réussie');
      res.status(200).json({ message: 'Connexion réussie' });
    } catch (error) {
      logger.warn({ username: dto.username, ip: req.ip }, 'Connexion échouée');
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user) {
        await this.authService.logout(req.user.sessionId);
        logger.info({ username: req.user.username }, 'Déconnexion');
      }
      clearSessionCookie(res);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      username: req.user?.username,
      displayName: req.user?.displayName,
    });
  };
}
