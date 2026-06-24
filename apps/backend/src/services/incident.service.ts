import { DossierRepository } from '../repositories/dossier.repository';
import { IncidentDossier } from '../types/dossier.types';
import type { DossierStatutUpdatable } from '../constants/dossier-statut';
import { AppError } from '../middlewares/error.middleware';

export class IncidentService {
  constructor(private readonly dossierRepository: DossierRepository) {}

  async getAllIncidents(): Promise<IncidentDossier[]> {
    return this.dossierRepository.findAll();
  }

  async updateIncidentStatut(
    id: string,
    statut: DossierStatutUpdatable,
  ): Promise<IncidentDossier> {
    const dossier = await this.dossierRepository.updateStatut(id, statut);
    if (!dossier) {
      throw new AppError(404, 'Incident non trouvé');
    }
    return dossier;
  }
}
