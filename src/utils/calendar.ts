import type { HistoryEntry } from '../store/types';
import { dayKey } from './date';

/** Nombre de jours dans un mois donné (month: 0-11). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Index du jour de la semaine (0 = lundi ... 6 = dimanche) du 1er du mois. */
export function firstWeekdayOfMonth(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay(); // 0 = dimanche ... 6 = samedi
  return (jsDay + 6) % 7; // recale sur lundi = 0
}

export const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const MONTH_LABELS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

/** Regroupe l'historique par clé de jour ("AAAA-MM-JJ") -> total des variations de ce jour. */
export function groupHistoryByDay(history: HistoryEntry[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const entry of history) {
    const key = dayKey(entry.timestamp);
    map.set(key, (map.get(key) ?? 0) + entry.delta);
  }
  return map;
}

/** Regroupe l'historique par clé de jour -> liste des entrées de ce jour (triées desc). */
export function groupHistoryEntriesByDay(history: HistoryEntry[]): Map<string, HistoryEntry[]> {
  const map = new Map<string, HistoryEntry[]>();
  for (const entry of history) {
    const key = dayKey(entry.timestamp);
    const list = map.get(key);
    if (list) list.push(entry);
    else map.set(key, [entry]);
  }
  for (const list of map.values()) list.sort((a, b) => b.timestamp - a.timestamp);
  return map;
}
