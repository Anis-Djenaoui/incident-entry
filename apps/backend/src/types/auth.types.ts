export interface UserSession {
  id: string;
  username: string;
  displayName: string;
  alfrescoTicketEncrypted: string;
  sessionHash: string;
  expiresAt: Date;
  lastActivity: Date;
  createdAt: Date;
  revoked: boolean;
}

/**
 * Représentation de l'utilisateur authentifié injectée dans `req.user`.
 * Ne contient jamais le ticket Alfresco ni d'informations sensibles.
 */
export interface AuthenticatedUser {
  sessionId: string;
  username: string;
  displayName: string;
}

export interface AlfrescoTicket {
  id: string;
  userId: string;
}

export interface AlfrescoPerson {
  id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginDto {
  username: string;
  password: string;
}
