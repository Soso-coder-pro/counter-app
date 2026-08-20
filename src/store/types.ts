/**
 * Modèle de données central de l'application "Compteur".
 *
 * Ce fichier définit la forme complète des données, y compris les champs
 * utiles aux itérations futures (statistiques, challenge, options d'affichage…)
 * afin d'éviter des migrations de schéma trop fréquentes. Seul un sous-ensemble
 * de ces champs est réellement exploité par l'UI du MVP — voir ARCHITECTURE.md.
 */

export type ID = string;

/** Origine d'un clic, utile pour les stats / le debug plus tard. */
export type HistorySource = 'button-plus' | 'button-minus' | 'volume-up' | 'volume-down' | 'manual';

/** Une ligne d'historique = un évènement horodaté à la seconde près. */
export interface HistoryEntry {
  id: ID;
  counterId: ID;
  /** Variation appliquée (peut être négative). */
  delta: number;
  /** Valeur du compteur juste après cet évènement. */
  value: number;
  /** epoch ms — permet heure/minute/seconde ET le regroupement par jour. */
  timestamp: number;
  source: HistorySource;
}

/** Un compteur individuel. */
export interface Counter {
  id: ID;
  listId: ID;
  name: string;
  value: number;
  /** Valeur d'incrément courante (ex: 1, 2, 5, 10, 100...), modifiable à tout moment. */
  step: number;
  /** Position d'affichage dans la liste (plus petit = plus haut). */
  order: number;
  createdAt: number;
  /** Dernière remise à zéro, si applicable. */
  resetAt: number | null;
  /** Dernier clic (tout type confondu), pour les stats "dernier clic". */
  lastClickAt: number | null;
  /** Objectif optionnel, pour le futur mode "Challenge". */
  goal: number | null;
}

/** Une liste (thème / challenge) regroupant plusieurs compteurs. */
export interface CounterList {
  id: ID;
  name: string;
  order: number;
  createdAt: number;
  /** Si vrai, un nouveau compteur est inséré en haut plutôt qu'en bas. */
  newCounterAtTop: boolean;
  /** Masque le total/moyenne affichés en en-tête de liste (option future, câblée dès maintenant). */
  hideSumAndAverage: boolean;
}

/** Réglages globaux de l'application (paramètres). */
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  hapticsOnTap: boolean;
  /** Affiche le bouton "-" sur les compteurs (peut être masqué globalement). */
  showMinusButton: boolean;
  /** Capture des boutons de volume physiques comme +/- (nécessite un dev client). */
  volumeButtonsEnabled: boolean;
  keepScreenAwake: boolean;
}

export interface CounterStoreData {
  lists: CounterList[];
  counters: Counter[];
  history: HistoryEntry[];
  settings: AppSettings;
}
