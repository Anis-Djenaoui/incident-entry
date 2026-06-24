import { body } from 'express-validator';
import { DOSSIER_STATUT_UPDATABLE_VALUES } from '../constants/dossier-statut';

export const updateIncidentStatutValidation = [
  body('statut')
    .notEmpty()
    .withMessage('Le statut est obligatoire')
    .isIn([...DOSSIER_STATUT_UPDATABLE_VALUES])
    .withMessage("Le statut doit être 'confirme' ou 'rejete'"),
];
