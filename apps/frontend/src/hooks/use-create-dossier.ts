'use client';

import { useMutation } from '@tanstack/react-query';
import { createDossier } from '@/lib/api/dossier.api';
import type { CreateDossierPayload } from '@/lib/schemas/dossier.schema';

export const useCreateDossier = () => {
  return useMutation({
    mutationFn: (payload: CreateDossierPayload) => createDossier(payload),
  });
};
