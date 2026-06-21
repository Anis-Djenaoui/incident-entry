import { db } from '../config/database';
import { UserSession } from '../types/auth.types';

interface UserSessionRow {
  id: string;
  username: string;
  display_name: string;
  alfresco_ticket_encrypted: string;
  session_hash: string;
  expires_at: Date;
  last_activity: Date;
  created_at: Date;
  revoked: boolean;
}

interface CreateSessionData {
  username: string;
  displayName: string;
  alfrescoTicketEncrypted: string;
  sessionHash: string;
  expiresAt: Date;
}

const TABLE = 'user_sessions';

const mapRow = (row: UserSessionRow): UserSession => ({
  id: row.id,
  username: row.username,
  displayName: row.display_name,
  alfrescoTicketEncrypted: row.alfresco_ticket_encrypted,
  sessionHash: row.session_hash,
  expiresAt: row.expires_at,
  lastActivity: row.last_activity,
  createdAt: row.created_at,
  revoked: row.revoked,
});

export class SessionRepository {
  async create(data: CreateSessionData): Promise<UserSession> {
    const [row] = await db(TABLE)
      .insert({
        username: data.username,
        display_name: data.displayName,
        alfresco_ticket_encrypted: data.alfrescoTicketEncrypted,
        session_hash: data.sessionHash,
        expires_at: data.expiresAt,
      })
      .returning('*');

    return mapRow(row as UserSessionRow);
  }

  async findActiveByHash(sessionHash: string): Promise<UserSession | null> {
    const row = await db(TABLE)
      .where({ session_hash: sessionHash, revoked: false })
      .first();

    if (!row) return null;
    return mapRow(row as UserSessionRow);
  }

  async touch(id: string, lastActivity: Date): Promise<void> {
    await db(TABLE).where({ id }).update({ last_activity: lastActivity });
  }

  async revoke(id: string): Promise<void> {
    await db(TABLE).where({ id }).update({ revoked: true });
  }
}
