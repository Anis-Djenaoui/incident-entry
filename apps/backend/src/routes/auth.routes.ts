import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { AlfrescoService } from '../services/alfresco.service';
import { SessionService } from '../services/session.service';
import { SessionRepository } from '../repositories/session.repository';
import { EncryptionService } from '../services/encryption.service';
import { createAuthMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { loginValidation } from '../middlewares/auth.validation';
import { loginRateLimiter } from '../middlewares/rate-limit.middleware';
import { config } from '../config/env';

const encryptionService = new EncryptionService(config.session.encryptionKey);
const sessionRepository = new SessionRepository();
const sessionService = new SessionService(sessionRepository, encryptionService);
const alfrescoService = new AlfrescoService();
const authService = new AuthService(alfrescoService, sessionService);
const authController = new AuthController(authService);

const authMiddleware = createAuthMiddleware(sessionService);

const router = Router();

router.post('/login', loginRateLimiter, validate(loginValidation), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);

export { router as authRoutes, authMiddleware };
