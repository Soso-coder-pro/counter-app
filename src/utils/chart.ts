import type { BarChartPoint } from '../components/MiniBarChart';
import type { HistoryEntry } from '../store/types';
import { groupHistoryByDay } from './calendar';
import { dayKey, shortDayLabel } from './date';
import { periodStart, type HistoryPeriod } from './period';

const MAX_ALL_TIME_BUCKETS = 60;

/**
 * Série quotidienne (somme des variations par jour) pour le graphique
 * d'évolution. Pour les périodes bornées, un point par jour calendaire (même
 * à 0) pour garder l'échelle lisible ; pour "Tout", uniquement les jours où
 * il y a eu de l'activité (plafonné pour rester lisible sur un historique
 * long).
 */
export function buildDailySeries(history: HistoryEntry[], period: HistoryPeriod): BarChartPoint[] {
  const byDay = groupHistoryByDay(history);

  if (period === 'all') {
    const keys = [...byDay.keys()].sort();
    const capped = keys.slice(-MAX_ALL_TIME_BUCKETS);
    return capped.map((key) => ({ label: shortDayLabel(key), value: byDay.get(key) ?? 0 }));
  }

  const start = new Date(periodStart(period));
  start.setHours(0, 0, 0, 0);
  const end = new Date();

  const points: BarChartPoint[] = [];
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    const key = dayKey(cursor.getTime());
    points.push({ label: shortDayLabel(key), value: byDay.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return points;
}
