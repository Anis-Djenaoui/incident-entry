import { Router } from 'express';
import { DossierController } from '../controllers/dossier.controller';
import { DossierService } from '../services/dossier.service';
import { DossierRepository } from '../repositories/dossier.repository';
import { DocumentGenerationService } from '../services/document-generation.service';
import { validate } from '../middlewares/validate.middleware';
import { createDossierValidation } from '../middlewares/dossier.validation';

const dossierRepository = new DossierRepository();
const documentGenerationService = new DocumentGenerationService();
const dossierService = new DossierService(dossierRepository, documentGenerationService);
const dossierController = new DossierController(dossierService);

const router = Router();

router.post('/dossiers', validate(createDossierValidation), dossierController.create);
router.get('/dossiers/:id', dossierController.getById);
router.get('/documents/:id/download', dossierController.downloadDocument);

export default router;
