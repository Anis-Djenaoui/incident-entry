import crypto from 'crypto';
import { config } from '../config/env';
import { SessionRepository } from '../repositories/session.repository';
import { EncryptionService } from './encryption.service';
import { AuthenticatedUser, UserSession } from '../types/auth.types';

const SESSION_TOKEN_BYTES = 32;
const HOUR_IN_MS = 60 * 60 * 1000;

export interface CreatedSession {
  /** Token brut, transmis uniquement via le cookie HttpOnly. Jamais persisté. */
  token: string;
  session: UserSession;
}

export interface SessionValidationResult {
  user: AuthenticatedUser;
  session: UserSession;
}

/**
 * Service de gestion des sessions locales.
 *
 * - Le token brut n'est jamais stocké : seul son SHA-256 (`session_hash`) est
 *   persisté.
 * - Le ticket Alfresco est chiffré (AES-256-GCM) avant stockage.
 * - La durée de session et l'inactivité maximale sont alignées sur
 *   `SESSION_DURATION_HOURS`.
 */
export class SessionService {
  private readonly inactivityLimitMs: number;
  private readonly durationMs: number;

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly encryptionService: EncryptionService,
  ) {
    this.durationMs = config.session.durationHours * HOUR_IN_MS;
    this.inactivityLimitMs = this.durationMs;
  }

  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async createSession(params: {
    username: string;
    displayName: string;
    alfrescoTicket: string;
  }): Promise<CreatedSession> {
    const token = crypto.randomBytes(SESSION_TOKEN_BYTES).toString('hex');
    const sessionHash = SessionService.hashToken(token);
    const expiresAt = new Date(Date.now() + this.durationMs);

    const session = await this.sessionRepository.create({
      username: params.username,
      displayName: params.displayName,
      alfrescoTicketEncrypted: this.encryptionService.encrypt(params.alfrescoTicket),
      sessionHash,
      expiresAt,
    });

    return { token, session };
  }

  /**
   * Valide un token de session : recherche, expiration, révocation et
   * inactivité. Révoque automatiquement les sessions expirées/inactives.
   * Retourne `null` si la session est invalide.
   */
  async validateToken(token: string): Promise<SessionValidationResult | null> {
    const sessionHash = SessionService.hashToken(token);
    const session = await this.sessionRepository.findActiveByHash(sessionHash);

    if (!session) {
      return null;
    }

    const now = Date.now();

    if (session.expiresAt.getTime() <= now) {
      await this.sessionRepository.revoke(session.id);
      return null;
    }

    const inactiveFor = now - session.lastActivity.getTime();
    if (inactiveFor > this.inactivityLimitMs) {
      await this.sessionRepository.revoke(session.id);
      return null;
    }

    await this.sessionRepository.touch(session.id, new Date(now));

    return {
      user: {
        sessionId: session.id,
        username: session.username,
        displayName: session.displayName,
      },
      session,
    };
  }

  async revoke(sessionId: string): Promise<void> {
    await this.sessionRepository.revoke(sessionId);
  }

  /** Déchiffre le ticket Alfresco associé à une session (usage interne). */
  decryptTicket(session: UserSession): string {
    return this.encryptionService.decrypt(session.alfrescoTicketEncrypted);
  }
}
