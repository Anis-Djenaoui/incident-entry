export const DOSSIER_STATUT_VALUES = ['ouvert', 'confirme', 'rejete'] as const;

export type DossierStatut = (typeof DOSSIER_STATUT_VALUES)[number];

export const DOSSIER_STATUT_UPDATABLE_VALUES = ['confirme', 'rejete'] as const;

export type DossierStatutUpdatable = (typeof DOSSIER_STATUT_UPDATABLE_VALUES)[number];
