/** Générateur d'identifiants simple, suffisant pour un usage local (pas de sync serveur). */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
