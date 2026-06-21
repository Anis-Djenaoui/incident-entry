import { AlfrescoService } from './alfresco.service';
import { SessionService, CreatedSession } from './session.service';
import { LoginDto } from '../types/auth.types';

/**
 * Orchestrateur d'authentification : relie le fournisseur d'identité Alfresco
 * à la gestion des sessions locales.
 */
export class AuthService {
  constructor(
    private readonly alfrescoService: AlfrescoService,
    private readonly sessionService: SessionService,
  ) {}

  async login(dto: LoginDto): Promise<CreatedSession> {
    const ticket = await this.alfrescoService.createTicket(dto.username, dto.password);
    const person = await this.alfrescoService.getCurrentPerson(ticket.id);

    return this.sessionService.createSession({
      username: person.id,
      displayName: person.displayName,
      alfrescoTicket: ticket.id,
    });
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.revoke(sessionId);
  }
}
