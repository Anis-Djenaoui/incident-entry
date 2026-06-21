export const COMPAGNIE_VALUES = [
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

export type Compagnie = (typeof COMPAGNIE_VALUES)[number];

/** Noms arabes pour le template DOCX (voir liste-compagnies.md). */
export const COMPAGNIE_ARABIC: Partial<Record<Compagnie, string>> = {
  CAAR: 'CAAR الشركة الجزائرية للتأمين وإعادة التأمين',
  SAA: 'SAA الشركة الوطنية للتأمين',
  CAAT: 'CAAT الشركة الجزائرية للتأمينات',
  CIAR: 'CIAR الشركة الدولية للتأمين وإعادة التأمين',
  CASH: 'CASH الشركة الجزائرية للتأمينات المتخصصة (كاش للتأمينات)',
  CNMA: 'CNMA الصندوق الوطني للتعاضد الفلاحي',
  GAM: 'GAM الشركة العامة للتأمين المتوسطي',
  ALLIANCE: 'ALLIANCE أليانس للتأمينات',
  TRUST: 'TRUST تراست الجزائر للتأمينات',
  SALAMA: 'SALAMA سلامة للتأمينات الجزائر',
  AXA: 'AXA أكسا للتأمينات الجزائر',
};

export function getCompagnieArabic(compagnie: Compagnie): string {
  return COMPAGNIE_ARABIC[compagnie] ?? compagnie;
}
