import type { HistoryEntry } from '../store/types';

export type HistoryPeriod = 'day' | '7d' | '30d' | '90d' | 'month' | 'all';

export const PERIOD_OPTIONS: { key: HistoryPeriod; label: string }[] = [
  { key: 'day', label: 'Quotidien' },
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
  { key: '90d', label: '90 jours' },
  { key: 'month', label: 'Mensuel' },
  { key: 'all', label: 'Tout' },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Borne de début (epoch ms) pour une période donnée, relative à "maintenant". */
export function periodStart(period: HistoryPeriod, now = Date.now()): number {
  switch (period) {
    case 'day': {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case '7d':
      return now - 7 * DAY_MS;
    case '30d':
      return now - 30 * DAY_MS;
    case '90d':
      return now - 90 * DAY_MS;
    case 'month': {
      const d = new Date(now);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case 'all':
      return -Infinity;
  }
}

export function filterByPeriod(entries: HistoryEntry[], period: HistoryPeriod, now = Date.now()): HistoryEntry[] {
  const start = periodStart(period, now);
  return entries.filter((e) => e.timestamp >= start);
}

/** Valeur accumulée depuis minuit (heure locale) — pour le toggle "Aujourd'hui" / "Total". */
export function computeTodayValue(history: HistoryEntry[], now = Date.now()): number {
  const start = periodStart('day', now);
  return history.reduce((sum, entry) => (entry.timestamp >= start ? sum + entry.delta : sum), 0);
}

/** Message d'état vide adapté à la période sélectionnée. */
export function emptyMessageForPeriod(period: HistoryPeriod): string {
  switch (period) {
    case 'day':
      return "Aucun décompte aujourd'hui.";
    case '7d':
      return 'Aucun décompte au cours des 7 derniers jours.';
    case '30d':
      return 'Aucun décompte au cours des 30 derniers jours.';
    case '90d':
      return 'Aucun décompte au cours des 90 derniers jours.';
    case 'month':
      return 'Aucun décompte ce mois-ci.';
    case 'all':
      return 'Aucun décompte enregistré pour le moment.';
  }
}
