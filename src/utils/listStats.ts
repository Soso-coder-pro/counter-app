import type { Counter } from '../store/types';

export interface ListStats {
  /** Compteurs actifs (non archivés) dans la liste. */
  activeCount: number;
  sum: number;
  average: number;
  /** Valeur du compteur le plus bas / le plus haut de la liste. */
  min: number;
  max: number;
}

/** Statistiques agrégées d'un défi (liste), sur l'ensemble de ses compteurs actifs. */
export function computeListStats(counters: Counter[]): ListStats {
  const values = counters.map((c) => c.value);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const average = counters.length > 0 ? sum / counters.length : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  return { activeCount: counters.length, sum, average, min, max };
}
