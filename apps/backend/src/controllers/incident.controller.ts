import { Request, Response, NextFunction } from 'express';
import { IncidentService } from '../services/incident.service';
import type { DossierStatutUpdatable } from '../constants/dossier-statut';

export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const incidents = await this.incidentService.getAllIncidents();
      res.json(incidents);
    } catch (error) {
      next(error);
    }
  };

  updateStatut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const statut = req.body.statut as DossierStatutUpdatable;
      const incident = await this.incidentService.updateIncidentStatut(id, statut);
      res.json(incident);
    } catch (error) {
      next(error);
    }
  };
}
