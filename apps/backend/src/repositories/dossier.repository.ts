import { db } from '../config/database';
import {
  CreateDossierDto,
  IncidentDossier,
  IncidentDossierRow,
} from '../types/dossier.types';

const mapRowToDossier = (row: IncidentDossierRow): IncidentDossier => ({
  id: row.id,
  numeroDossier: row.numero_dossier,
  compagnie: row.compagnie as IncidentDossier['compagnie'],
  dateSurvenance: formatDate(row.date_survenance),
  immatriculation: row.immatriculation,
  nomAssure: row.nom_assure,
  nomConducteur: row.nom_conducteur,
  nomTier: row.nom_tier,
  numeroCarteOrange: row.numero_carte_orange,
  dateEffet: formatDate(row.date_effet),
  dateEcheance: formatDate(row.date_echeance),
  natureIncident: row.nature_incident as IncidentDossier['natureIncident'],
  provision: parseFloat(row.provision),
  generatedDocPath: row.generated_doc_path,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

export class DossierRepository {
  async create(dto: CreateDossierDto): Promise<IncidentDossier> {
    const [row] = await db('incident_dossiers')
      .insert({
        numero_dossier: dto.numeroDossier,
        compagnie: dto.compagnie,
        date_survenance: dto.dateSurvenance,
        immatriculation: dto.immatriculation,
        nom_assure: dto.nomAssure,
        nom_conducteur: dto.nomConducteur,
        nom_tier: dto.nomTier,
        numero_carte_orange: dto.numeroCarteOrange,
        date_effet: dto.dateEffet,
        date_echeance: dto.dateEcheance,
        nature_incident: dto.natureIncident,
        provision: dto.provision,
      })
      .returning('*');

    return mapRowToDossier(row as IncidentDossierRow);
  }

  async findById(id: string): Promise<IncidentDossier | null> {
    const row = await db('incident_dossiers').where({ id }).first();
    if (!row) return null;
    return mapRowToDossier(row as IncidentDossierRow);
  }

  async updateDocumentPath(id: string, docPath: string): Promise<void> {
    await db('incident_dossiers')
      .where({ id })
      .update({
        generated_doc_path: docPath,
        updated_at: db.fn.now(),
      });
  }
}
