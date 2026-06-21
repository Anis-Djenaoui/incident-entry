import fs from 'fs/promises';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { config, resolveFromRoot } from '../config/env';
import { getCompagnieArabic } from '../constants/compagnie';
import { CreateDossierDto, DocumentTemplateData, NatureIncident } from '../types/dossier.types';
import { AppError } from '../middlewares/error.middleware';

const NATURE_INCIDENT_ARABIC: Record<NatureIncident, string> = {
  corporel: 'بدنية',
  materiel: 'مادية',
};

export class DocumentGenerationService {
  private templatePath: string;
  private storagePath: string;

  constructor() {
    this.templatePath = resolveFromRoot(config.docxTemplatePath);
    this.storagePath = resolveFromRoot(config.documentStoragePath);
  }

  private formatTemplateData(dto: CreateDossierDto): DocumentTemplateData {
    return {
      numeroDossier: dto.numeroDossier,
      compagnie: getCompagnieArabic(dto.compagnie),
      dateSurvenance: this.formatDisplayDate(dto.dateSurvenance),
      immatriculation: dto.immatriculation,
      nomAssure: dto.nomAssure,
      nomConducteur: dto.nomConducteur,
      nomTier: dto.nomTier,
      numeroCarteOrange: dto.numeroCarteOrange,
      dateEffet: this.formatDisplayDate(dto.dateEffet),
      dateEcheance: this.formatDisplayDate(dto.dateEcheance),
      natureIncident: NATURE_INCIDENT_ARABIC[dto.natureIncident],
      provision: dto.provision.toFixed(2),
    };
  }

  private formatDisplayDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  private formatTemplateError(error: unknown): string {
    if (
      error &&
      typeof error === 'object' &&
      'properties' in error &&
      error.properties &&
      typeof error.properties === 'object' &&
      'errors' in error.properties &&
      Array.isArray(error.properties.errors)
    ) {
      const messages = error.properties.errors
        .map((e: { properties?: { explanation?: string } }) => e.properties?.explanation)
        .filter(Boolean);
      if (messages.length > 0) {
        return `Erreur de template DOCX : ${messages[0]}`;
      }
    }

    if (error instanceof Error) {
      return `Erreur de génération DOCX : ${error.message}`;
    }

    return 'Erreur de génération DOCX';
  }

  async generate(dossierId: string, dto: CreateDossierDto): Promise<string> {
    try {
      await fs.access(this.templatePath);
    } catch {
      throw new AppError(500, `Template DOCX introuvable: ${this.templatePath}`);
    }

    await fs.mkdir(this.storagePath, { recursive: true });

    const templateContent = await fs.readFile(this.templatePath);
    const zip = new PizZip(templateContent);

    let doc: Docxtemplater;
    try {
      doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' },
      });
    } catch (error) {
      throw new AppError(500, this.formatTemplateError(error));
    }

    const templateData = this.formatTemplateData(dto);
    try {
      doc.render(templateData);
    } catch (error) {
      throw new AppError(500, this.formatTemplateError(error));
    }

    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    const fileName = `incident-${dossierId}.docx`;
    const filePath = path.join(this.storagePath, fileName);
    await fs.writeFile(filePath, buffer);

    return filePath;
  }

  async getDocumentPath(dossierId: string): Promise<string | null> {
    const fileName = `incident-${dossierId}.docx`;
    const filePath = path.join(this.storagePath, fileName);

    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      return null;
    }
  }
}
