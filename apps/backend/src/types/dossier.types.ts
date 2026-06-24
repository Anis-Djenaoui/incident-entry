import type { Compagnie } from '../constants/compagnie';
import type { DossierStatut } from '../constants/dossier-statut';

export type NatureIncident = 'corporel' | 'materiel';

export interface CreateDossierDto {
  numeroDossier: string;
  compagnie: Compagnie;
  dateSurvenance: string;
  immatriculation: string;
  nomAssure: string;
  nomConducteur: string;
  nomTier: string;
  numeroCarteOrange: string;
  dateEffet: string;
  dateEcheance: string;
  natureIncident: NatureIncident;
  provision: number;
}

export interface IncidentDossier extends CreateDossierDto {
  id: string;
  statut: DossierStatut;
  generatedDocPath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentDossierRow {
  id: string;
  numero_dossier: string;
  compagnie: string;
  date_survenance: Date;
  immatriculation: string;
  nom_assure: string;
  nom_conducteur: string;
  nom_tier: string;
  numero_carte_orange: string;
  date_effet: Date;
  date_echeance: Date;
  nature_incident: string;
  provision: string;
  statut: string;
  generated_doc_path: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDossierResponse {
  id: string;
  documentUrl: string;
  message: string;
}

export interface DocumentTemplateData {
  numeroDossier: string;
  compagnie: string;
  dateSurvenance: string;
  immatriculation: string;
  nomAssure: string;
  nomConducteur: string;
  nomTier: string;
  numeroCarteOrange: string;
  dateEffet: string;
  dateEcheance: string;
  natureIncident: string;
  provision: string;
}
