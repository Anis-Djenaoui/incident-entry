import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller';
import { IncidentService } from '../services/incident.service';
import { DossierRepository } from '../repositories/dossier.repository';
import { validate } from '../middlewares/validate.middleware';
import { updateIncidentStatutValidation } from '../middlewares/incident.validation';

const dossierRepository = new DossierRepository();
const incidentService = new IncidentService(dossierRepository);
const incidentController = new IncidentController(incidentService);

const router = Router();

router.get('/incidents', incidentController.getAll);
router.patch(
  '/incidents/:id',
  validate(updateIncidentStatutValidation),
  incidentController.updateStatut,
);

export default router;
