import axios, { AxiosInstance, isAxiosError } from 'axios';
import { config } from '../config/env';
import { AppError } from '../middlewares/error.middleware';
import { AlfrescoPerson, AlfrescoTicket } from '../types/auth.types';

const TICKETS_PATH = '/alfresco/api/-default-/public/authentication/versions/1/tickets';
const ME_PATH = '/alfresco/api/-default-/public/alfresco/versions/1/people/-me-';

/**
 * Service d'authentification adossé à Alfresco ACS.
 *
 * Alfresco joue le rôle de fournisseur d'identité : aucun mot de passe n'est
 * stocké côté application. Le mot de passe sert uniquement à obtenir un ticket
 * via l'API Ticket, ticket qui est ensuite utilisé (encodé en Basic) pour
 * récupérer le profil utilisateur.
 */
export class AlfrescoService {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: config.alfresco.baseUrl,
      timeout: 10_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Authentifie l'utilisateur auprès d'Alfresco et retourne le ticket émis.
   * Lève une `AppError(401)` si les identifiants sont invalides.
   */
  async createTicket(userId: string, password: string): Promise<AlfrescoTicket> {
    try {
      const { data } = await this.http.post<{ entry: AlfrescoTicket }>(TICKETS_PATH, {
        userId,
        password,
      });

      if (!data?.entry?.id) {
        throw new AppError(401, 'Identifiants invalides');
      }

      return data.entry;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          throw new AppError(401, 'Identifiants invalides');
        }
        throw new AppError(502, "Le fournisseur d'identité est indisponible");
      }
      throw error;
    }
  }

  /**
   * Récupère le profil de l'utilisateur courant à partir d'un ticket valide.
   */
  async getCurrentPerson(ticket: string): Promise<AlfrescoPerson> {
    try {
      const { data } = await this.http.get<{ entry: AlfrescoPerson }>(ME_PATH, {
        headers: { Authorization: AlfrescoService.toBasicAuth(ticket) },
      });

      const entry = data?.entry;
      if (!entry?.id) {
        throw new AppError(401, 'Identifiants invalides');
      }

      const displayName =
        entry.displayName?.trim() ||
        [entry.firstName, entry.lastName].filter(Boolean).join(' ').trim() ||
        entry.id;

      return { ...entry, displayName };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          throw new AppError(401, 'Identifiants invalides');
        }
        throw new AppError(502, "Le fournisseur d'identité est indisponible");
      }
      throw error;
    }
  }

  /**
   * Encode un ticket Alfresco en en-tête Basic, conformément au mécanisme
   * d'authentification par ticket d'Alfresco (base64 du ticket seul).
   */
  private static toBasicAuth(ticket: string): string {
    return `Basic ${Buffer.from(ticket).toString('base64')}`;
  }
}
