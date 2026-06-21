import { apiClient } from '@/lib/api/client';
import { withBasePath } from '@/lib/base-path';
import type { CreateDossierPayload, CreateDossierResponse } from '@/lib/schemas/dossier.schema';

export const createDossier = async (
  payload: CreateDossierPayload,
): Promise<CreateDossierResponse> => {
  const { data } = await apiClient.post<CreateDossierResponse>('/api/dossiers', payload);
  return data;
};

export const getDocumentDownloadUrl = (documentUrl: string): string => {
  if (documentUrl.startsWith('http')) {
    return documentUrl;
  }
  return withBasePath(documentUrl);
};
