export const Ranking: Record<string, number[]> = {
  // Menores de 16
  BRANCA: [0, 1, 2, 3, 4],
  CINZA_BRANCA: [0, 1, 2, 3, 4],
  CINZA: [0, 1, 2, 3, 4],
  CINZA_PRETA: [0, 1, 2, 3, 4],
  AMARELA_BRANCA: [0, 1, 2, 3, 4],
  AMARELA: [0, 1, 2, 3, 4],
  AMARELA_PRETA: [0, 1, 2, 3, 4],
  LARANJA_BRANCA: [0, 1, 2, 3, 4],
  LARANJA: [0, 1, 2, 3, 4],
  LARANJA_PRETA: [0, 1, 2, 3, 4],
  VERDE_BRANCA: [0, 1, 2, 3, 4],
  VERDE: [0, 1, 2, 3, 4],
  VERDE_PRETA: [0, 1, 2, 3, 4],

  // Maiores de 16
  AZUL: [0, 1, 2, 3, 4],
  ROXA: [0, 1, 2, 3, 4],
  MARROM: [0, 1, 2, 3, 4],
  PRETA: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  VERMELHA: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],

  // Non Colorful ranks
  KIDS: [0, 1, 2, 3, 4],
  JUVENIL: [0, 1, 2, 3, 4],
};

// Rank progression sequences
export const JuniorRankProgression = [
  'BRANCA',
  'CINZA_BRANCA',
  'CINZA',
  'CINZA_PRETA',
  'AMARELA_BRANCA',
  'AMARELA',
  'AMARELA_PRETA',
  'LARANJA_BRANCA',
  'LARANJA',
  'LARANJA_PRETA',
  'VERDE_BRANCA',
  'VERDE',
  'VERDE_PRETA',
] as const;

export const AdultRankProgression = [
  'AZUL',
  'ROXA',
  'MARROM',
  'PRETA',
  'VERMELHA',
] as const;

export const KidsRankProgression = ['KIDS'] as const;
export const JuvenilRankProgression = ['JUVENIL'] as const;

/**
 * Get the next rank in progression sequence
 * @param currentRank - The current rank of the student
 * @returns The next rank, or null if already at the highest rank
 */
export function getNextRank(currentRank: string): string | null {
  // Check junior ranks
  const juniorIndex = JuniorRankProgression.indexOf(currentRank as any);
  if (juniorIndex !== -1 && juniorIndex < JuniorRankProgression.length - 1) {
    return JuniorRankProgression[juniorIndex + 1];
  }

  // Check adult ranks
  const adultIndex = AdultRankProgression.indexOf(currentRank as any);
  if (adultIndex !== -1 && adultIndex < AdultRankProgression.length - 1) {
    return AdultRankProgression[adultIndex + 1];
  }

  // Kids and Juvenil don't progress
  if (currentRank === 'KIDS' || currentRank === 'JUVENIL') {
    return null;
  }

  // Already at highest rank or rank not found
  return null;
}
