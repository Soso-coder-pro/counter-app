/** Ratio de progression value/goal, brut (peut dépasser 1 si l'objectif est dépassé). */
export function progressRatio(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return value / goal;
}

/** Ratio bridé à [0, 1], pour le dessin (anneau/barre ne dépassent jamais visuellement). */
export function clampedProgress(value: number, goal: number): number {
  return Math.max(0, Math.min(1, progressRatio(value, goal)));
}

/** "420/600" */
export function formatGoalFraction(value: number, goal: number): string {
  return `${value}/${goal}`;
}

/** "70%" (arrondi, jamais négatif) */
export function formatGoalPercent(value: number, goal: number): string {
  const percent = Math.round(Math.max(0, progressRatio(value, goal)) * 100);
  return `${percent}%`;
}
