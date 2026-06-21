import { z } from 'zod';

export const COMPAGNIE_OPTIONS = [
  'DZ-TAKAFUL',
  'CAAR',
  'CNMA',
  'SAA',
  'CASH',
  'AXA',
  'CIAR',
  'ALLIANCE',
  'GAM',
  'GIG',
  'TRUST',
  'CAAT',
  'SALAMA',
] as const;

export const natureIncidentEnum = z.enum(['corporel', 'materiel'], {
  required_error: "La nature de l'incident est obligatoire",
});

export const compagnieEnum = z.enum(COMPAGNIE_OPTIONS, {
  required_error: 'La compagnie est obligatoire',
  invalid_type_error: 'La compagnie est invalide',
});

const isoDateSchema = (label: string) =>
  z
    .string()
    .min(1, `${label} est obligatoire`)
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} est invalide`);

export const dossierFormSchema = z
  .object({
    numeroDossier: z
      .string()
      .min(1, 'Le numéro de dossier est obligatoire')
      .max(100, 'Le numéro de dossier ne doit pas dépasser 100 caractères'),
    compagnie: compagnieEnum,
    dateSurvenance: isoDateSchema('La date de survenance'),
    immatriculation: z
      .string()
      .min(1, "L'immatriculation est obligatoire")
      .max(100, "L'immatriculation ne doit pas dépasser 100 caractères"),
    nomAssure: z
      .string()
      .min(1, "Le nom de l'assuré est obligatoire")
      .max(255, "Le nom de l'assuré ne doit pas dépasser 255 caractères"),
    nomConducteur: z
      .string()
      .min(1, 'Le nom du conducteur est obligatoire')
      .max(255, 'Le nom du conducteur ne doit pas dépasser 255 caractères'),
    copierNomAssure: z.boolean().default(false),
    nomTier: z
      .string()
      .min(1, 'Le nom du tiers est obligatoire')
      .max(255, 'Le nom du tiers ne doit pas dépasser 255 caractères'),
    numeroCarteOrange: z
      .string()
      .min(1, 'Le numéro de carte orange est obligatoire')
      .max(100, 'Le numéro de carte orange ne doit pas dépasser 100 caractères'),
    dateEffet: isoDateSchema("La date d'effet"),
    dateEcheance: isoDateSchema("La date d'échéance"),
    natureIncident: natureIncidentEnum,
    provision: z
      .number({
        required_error: 'La provision est obligatoire',
        invalid_type_error: 'La provision doit être un nombre',
      })
      .min(0, 'La provision doit être supérieure ou égale à zéro'),
  })
  .refine((data) => new Date(data.dateEcheance) > new Date(data.dateEffet), {
    message: "La date d'échéance doit être supérieure à la date d'effet",
    path: ['dateEcheance'],
  });

export type DossierFormValues = z.infer<typeof dossierFormSchema>;

export type CreateDossierPayload = {
  numeroDossier: string;
  compagnie: (typeof COMPAGNIE_OPTIONS)[number];
  dateSurvenance: string;
  immatriculation: string;
  nomAssure: string;
  nomConducteur: string;
  nomTier: string;
  numeroCarteOrange: string;
  dateEffet: string;
  dateEcheance: string;
  natureIncident: 'corporel' | 'materiel';
  provision: number;
};

export type CreateDossierResponse = {
  id: string;
  documentUrl: string;
  message: string;
};

export const formValuesToPayload = (values: DossierFormValues): CreateDossierPayload => ({
  numeroDossier: values.numeroDossier,
  compagnie: values.compagnie,
  dateSurvenance: values.dateSurvenance,
  immatriculation: values.immatriculation,
  nomAssure: values.nomAssure,
  nomConducteur: values.nomConducteur,
  nomTier: values.nomTier,
  numeroCarteOrange: values.numeroCarteOrange,
  dateEffet: values.dateEffet,
  dateEcheance: values.dateEcheance,
  natureIncident: values.natureIncident,
  provision: values.provision,
});
