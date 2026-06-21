import { body } from 'express-validator';
import { COMPAGNIE_VALUES } from '../constants/compagnie';
import { NatureIncident } from '../types/dossier.types';

const NATURE_INCIDENT_VALUES: NatureIncident[] = ['corporel', 'materiel'];

export const createDossierValidation = [
  body('numeroDossier')
    .trim()
    .notEmpty()
    .withMessage('Le numéro de dossier est obligatoire')
    .isLength({ max: 100 })
    .withMessage('Le numéro de dossier ne doit pas dépasser 100 caractères'),

  body('compagnie')
    .notEmpty()
    .withMessage('La compagnie est obligatoire')
    .isIn([...COMPAGNIE_VALUES])
    .withMessage('La compagnie sélectionnée est invalide'),

  body('dateSurvenance')
    .notEmpty()
    .withMessage('La date de survenance est obligatoire')
    .isISO8601({ strict: true })
    .withMessage('La date de survenance doit être au format ISO (YYYY-MM-DD)'),

  body('immatriculation')
    .trim()
    .notEmpty()
    .withMessage("L'immatriculation est obligatoire")
    .isLength({ max: 100 })
    .withMessage("L'immatriculation ne doit pas dépasser 100 caractères"),

  body('nomAssure')
    .trim()
    .notEmpty()
    .withMessage("Le nom de l'assuré est obligatoire")
    .isLength({ max: 255 })
    .withMessage("Le nom de l'assuré ne doit pas dépasser 255 caractères"),

  body('nomConducteur')
    .trim()
    .notEmpty()
    .withMessage('Le nom du conducteur est obligatoire')
    .isLength({ max: 255 })
    .withMessage('Le nom du conducteur ne doit pas dépasser 255 caractères'),

  body('nomTier')
    .trim()
    .notEmpty()
    .withMessage('Le nom du tiers est obligatoire')
    .isLength({ max: 255 })
    .withMessage('Le nom du tiers ne doit pas dépasser 255 caractères'),

  body('numeroCarteOrange')
    .trim()
    .notEmpty()
    .withMessage('Le numéro de carte orange est obligatoire')
    .isLength({ max: 100 })
    .withMessage('Le numéro de carte orange ne doit pas dépasser 100 caractères'),

  body('dateEffet')
    .notEmpty()
    .withMessage("La date d'effet est obligatoire")
    .isISO8601({ strict: true })
    .withMessage("La date d'effet doit être au format ISO (YYYY-MM-DD)"),

  body('dateEcheance')
    .notEmpty()
    .withMessage("La date d'échéance est obligatoire")
    .isISO8601({ strict: true })
    .withMessage("La date d'échéance doit être au format ISO (YYYY-MM-DD)")
    .custom((value, { req }) => {
      const dateEffet = req.body?.dateEffet;
      if (dateEffet && new Date(value) <= new Date(dateEffet)) {
        throw new Error("La date d'échéance doit être supérieure à la date d'effet");
      }
      return true;
    }),

  body('natureIncident')
    .notEmpty()
    .withMessage("La nature de l'incident est obligatoire")
    .isIn(NATURE_INCIDENT_VALUES)
    .withMessage("La nature de l'incident doit être 'corporel' ou 'materiel'"),

  body('provision')
    .notEmpty()
    .withMessage('La provision est obligatoire')
    .isFloat({ min: 0 })
    .withMessage('La provision doit être supérieure ou égale à zéro'),
];
