/** Formate un timestamp en "JJ/MM/AAAA à HH:MM:SS" (précision à la seconde). */
export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString('fr-FR');
  const time = d.toLocaleTimeString('fr-FR');
  return `${date} à ${time}`;
}

/** Clé de jour "AAAA-MM-JJ" en heure locale, pour grouper l'historique par jour. */
export function dayKey(timestamp: number): string {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
