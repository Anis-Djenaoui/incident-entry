import { Request, Response, NextFunction } from 'express';
import { DossierService } from '../services/dossier.service';
import { CreateDossierDto } from '../types/dossier.types';

export class DossierController {
  constructor(private readonly dossierService: DossierService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateDossierDto = {
        numeroDossier: req.body.numeroDossier,
        compagnie: req.body.compagnie,
        dateSurvenance: req.body.dateSurvenance,
        immatriculation: req.body.immatriculation,
        nomAssure: req.body.nomAssure,
        nomConducteur: req.body.nomConducteur,
        nomTier: req.body.nomTier,
        numeroCarteOrange: req.body.numeroCarteOrange,
        dateEffet: req.body.dateEffet,
        dateEcheance: req.body.dateEcheance,
        natureIncident: req.body.natureIncident,
        provision: parseFloat(req.body.provision),
      };

      const result = await this.dossierService.createDossier(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const dossier = await this.dossierService.getDossierById(id);
      res.json(dossier);
    } catch (error) {
      next(error);
    }
  };

  downloadDocument = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const docPath = await this.dossierService.getDocumentPath(id);
      const fileName = `incident-${id}.docx`;
      res.download(docPath, fileName);
    } catch (error) {
      next(error);
    }
  };
}
