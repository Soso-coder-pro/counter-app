import type { HistoryEntry } from '../store/types';
import { groupHistoryByDay } from './calendar';
import { dayKey } from './date';

export interface HeatmapCell {
  dateKey: string;
  date: Date;
  value: number;
  /** 0 = aucune activité, jusqu'à 4 = objectif largement dépassé / forte activité. */
  level: 0 | 1 | 2 | 3 | 4;
}

/**
 * Construit la grille des `weeks` dernières semaines (lundi -> dimanche),
 * une cellule par jour, avec un niveau d'intensité 0-4 :
 *
 * - Si `dailyGoal` est défini : niveau basé sur value/dailyGoal (objectif
 *   atteint ou non — c'est le cas du défi quotidien).
 * - Sinon : repli sur une intensité relative au maximum observé sur la
 *   période (comme le graphique de contributions GitHub), pour rester utile
 *   même sans défi quotidien actif.
 */
export function computeHeatmapDays(
  history: HistoryEntry[],
  dailyGoal: number | null,
  weeks = 18
): HeatmapCell[] {
  const byDay = groupHistoryByDay(history);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Aligne la fin de grille sur le dimanche de la semaine courante.
  const todayWeekday = (today.getDay() + 6) % 7; // 0 = lundi
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - todayWeekday));
  const start = new Date(end);
  start.setDate(start.getDate() - weeks * 7 + 1);

  const days: HeatmapCell[] = [];
  const cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    const key = dayKey(cursor.getTime());
    const value = byDay.get(key) ?? 0;
    days.push({ dateKey: key, date: new Date(cursor), value, level: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  if (dailyGoal && dailyGoal > 0) {
    for (const day of days) {
      const ratio = day.value / dailyGoal;
      day.level = ratio <= 0 ? 0 : ratio < 0.5 ? 1 : ratio < 1 ? 2 : ratio < 1.5 ? 3 : 4;
    }
  } else {
    const max = Math.max(1, ...days.map((d) => d.value));
    for (const day of days) {
      const ratio = day.value / max;
      day.level = ratio <= 0 ? 0 : ratio < 0.25 ? 1 : ratio < 0.5 ? 2 : ratio < 0.75 ? 3 : 4;
    }
  }

  return days;
}
