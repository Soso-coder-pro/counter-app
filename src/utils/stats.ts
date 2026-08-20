import type { Counter, HistoryEntry } from '../store/types';

export interface CounterStats {
  currentValue: number;
  min: number;
  max: number;
  clicksCount: number;
  createdAt: number;
  resetAt: number | null;
  lastClickAt: number | null;
  /** Moyenne de progression depuis la création (ou le dernier reset). */
  perMinute: number;
  perHour: number;
  perDay: number;
}

/** Calcule les statistiques d'un compteur à partir de son historique complet. */
export function computeCounterStats(counter: Counter, history: HistoryEntry[]): CounterStats {
  // On ne regarde que l'historique postérieur au dernier reset (le compteur
  // reparti de 0 à ce moment-là).
  const relevant = counter.resetAt ? history.filter((h) => h.timestamp >= counter.resetAt!) : history;
  const values = relevant.map((h) => h.value);

  // 0 fait toujours partie de la plage (valeur de départ / après reset).
  const min = values.length > 0 ? Math.min(0, ...values) : 0;
  const max = values.length > 0 ? Math.max(0, ...values) : 0;

  const since = counter.resetAt ?? counter.createdAt;
  const elapsedMs = Math.max(Date.now() - since, 1000); // évite une division par ~0

  return {
    currentValue: counter.value,
    min,
    max,
    clicksCount: relevant.length,
    createdAt: counter.createdAt,
    resetAt: counter.resetAt,
    lastClickAt: counter.lastClickAt,
    perMinute: counter.value / (elapsedMs / 60_000),
    perHour: counter.value / (elapsedMs / 3_600_000),
    perDay: counter.value / (elapsedMs / 86_400_000),
  };
}

/** Formate une moyenne avec 1 décimale, sans afficher "-0.0". */
export function formatRate(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded === 0 ? '0' : rounded.toFixed(1);
}
