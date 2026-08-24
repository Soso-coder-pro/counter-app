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

/**
 * Défi quotidien : objectif à atteindre chaque jour. `dailyGoal` reste
 * mémorisé même quand `enabled` passe à false (désactiver ≠ effacer la
 * valeur) — pas besoin de re-saisir le nombre si on réactive plus tard.
 * Aucun horodatage/reset à stocker ici : la progression du jour se calcule
 * à la volée depuis `HistoryEntry[]` (voir computeTodayValue), donc le
 * "reset à minuit" est automatique, sans job ni état à maintenir.
 */
export interface DailyChallenge {
  enabled: boolean;
  dailyGoal: number | null;
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
  /** Objectif global optionnel (mode "Challenge", vue "Total"). */
  goal: number | null;
  /** Défi quotidien optionnel (vue "Aujourd'hui"). */
  dailyChallenge: DailyChallenge;
  /** Date d'archivage, ou null si actif. Un compteur archivé n'apparaît plus
   * dans sa liste tant qu'il n'est pas restauré depuis l'Archive. */
  archivedAt: number | null;
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
  /** Date d'archivage, ou null si active. Archiver une liste archive aussi
   * ses compteurs actifs (cascade) ; les restaurer se fait indépendamment
   * depuis l'Archive. */
  archivedAt: number | null;
}

/**
 * Rappels locaux (expo-notifications) pour les défis quotidiens non atteints.
 * `times` au format "HH:MM" (24h, heure locale de l'appareil).
 */
export interface NotificationSettings {
  enabled: boolean;
  times: string[];
}

/** Réglages globaux de l'application (paramètres). */
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  hapticsOnTap: boolean;
  /** Affiche le bouton "-" sur les compteurs (peut être masqué globalement). */
  showMinusButton: boolean;
  /** Capture des boutons de volume physiques comme +/- (nécessite un dev client). */
  volumeButtonsEnabled: boolean;
  /** Empêche l'écran de se mettre en veille tant que l'app est au premier plan. */
  keepScreenAwake: boolean;
  notifications: NotificationSettings;
}

export interface CounterStoreData {
  lists: CounterList[];
  counters: Counter[];
  history: HistoryEntry[];
  settings: AppSettings;
}
