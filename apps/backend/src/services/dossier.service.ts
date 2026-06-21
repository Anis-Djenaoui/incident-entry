import { DossierRepository } from '../repositories/dossier.repository';
import { DocumentGenerationService } from './document-generation.service';
import {
  CreateDossierDto,
  CreateDossierResponse,
  IncidentDossier,
} from '../types/dossier.types';
import { AppError } from '../middlewares/error.middleware';

export class DossierService {
  constructor(
    private readonly dossierRepository: DossierRepository,
    private readonly documentGenerationService: DocumentGenerationService,
  ) {}

  async createDossier(dto: CreateDossierDto): Promise<CreateDossierResponse> {
    const dossier = await this.dossierRepository.create(dto);

    const docPath = await this.documentGenerationService.generate(dossier.id, dto);
    await this.dossierRepository.updateDocumentPath(dossier.id, docPath);

    return {
      id: dossier.id,
      documentUrl: `/api/documents/${dossier.id}/download`,
      message: 'Dossier créé avec succès',
    };
  }

  async getDossierById(id: string): Promise<IncidentDossier> {
    const dossier = await this.dossierRepository.findById(id);
    if (!dossier) {
      throw new AppError(404, 'Dossier non trouvé');
    }
    return dossier;
  }

  async getDocumentPath(id: string): Promise<string> {
    const dossier = await this.dossierRepository.findById(id);
    if (!dossier) {
      throw new AppError(404, 'Dossier non trouvé');
    }

    const docPath =
      dossier.generatedDocPath ||
      (await this.documentGenerationService.getDocumentPath(id));

    if (!docPath) {
      throw new AppError(404, 'Document non trouvé');
    }

    return docPath;
  }
}
