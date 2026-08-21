# Architecture — Compteur

Ce document décrit l'architecture cible de l'app (écrans + modèle de données),
pensée pour couvrir l'ensemble des fonctionnalités demandées, avec un MVP
implémenté en premier. Les sections marquées **[MVP]** sont codées ; le reste
est prévu par la structure mais viendra en itérations suivantes.

## Stack

- Expo SDK 57 + React Native 0.86 (New Architecture activée)
- Expo Router (navigation par fichiers, `app/`)
- Zustand + middleware `persist` (AsyncStorage) pour l'état + la sauvegarde locale
- TypeScript strict

## Écrans (`app/`)

```
app/
  _layout.tsx                        [MVP] Stack racine, hydrate le store, thème
  index.tsx                          [MVP] Accueil : liste des listes de compteurs
  list/[listId]/index.tsx            [MVP] Compteurs d'une liste, total/moyenne, + ajouter
  counter/[counterId]/index.tsx      [MVP] Détail d'un compteur : +/-, pas réglable, volume
  counter/[counterId]/history.tsx    [v2]  Historique horodaté + filtres de période
  counter/[counterId]/calendar.tsx   [v2]  Vue calendrier mensuelle (total du jour, détail au tap)
  counter/[counterId]/stats.tsx      [v2]  Statistiques (min/max, moyennes, dates, graphique)
  challenge.tsx                      [v3]  Page "Objectifs" : tous les compteurs à objectif global, barre de progression
  list/[listId]/stats.tsx            [v5]  Statistiques agrégées d'un défi (liste) : somme, moyenne, min/max, par compteur
  archive.tsx                        [v5]  Défis et compteurs archivés : restaurer ou supprimer définitivement

  # Itérations suivantes (non codées, mais compatibles avec le modèle de données actuel) :
  list/[listId]/settings.tsx         Réglages spécifiques à la liste (tri, affichage)
  settings/index.tsx                 Paramètres globaux (thème, langue, vibrations, écran…)
  settings/quick-add.tsx             Barre d'ajout rapide de compteur
```

> **Vocabulaire** : "défi" désigne une **liste** (`CounterList`) de compteurs.
> La page `challenge.tsx` (v3) a été renommée "Objectifs" dans l'UI pour ne
> pas entrer en collision avec ce terme — elle liste les compteurs ayant un
> objectif *global* (`goal`), toutes listes confondues, ce qui est un concept
> différent d'un défi/liste.

Menu contextuel (export CSV, anecdotes, partage, traduire/noter) : sera un
composant `ActionSheet`/`Menu` réutilisable branché sur les écrans liste et
compteur — pas d'écran dédié nécessaire.

### Composants et utilitaires ajoutés en v2

- `src/components/PeriodFilter.tsx` — sélecteur Quotidien/7j/30j/90j/Mensuel/Tout, réutilisé par l'historique et les stats.
- `src/components/HistoryRow.tsx` — ligne d'historique, extraite pour être partagée entre l'écran Historique et le détail de jour du Calendrier.
- `src/components/MiniBarChart.tsx` — graphique en barres minimaliste, uniquement des `<View>` dimensionnées (pas de dépendance SVG/charting native, donc rien à relier côté EAS).
- `src/utils/period.ts` — bornes de dates par période + message d'état vide adapté.
- `src/utils/calendar.ts` — grille du mois, regroupement de l'historique par jour.
- `src/utils/stats.ts` — calcul des statistiques d'un compteur (`computeCounterStats`).
- `src/utils/chart.ts` — construit la série quotidienne affichée par `MiniBarChart`.

### Composants et utilitaires ajoutés en v3 (toggle Aujourd'hui/Total + objectifs)

- `src/components/ViewModeToggle.tsx` — segmented control Aujourd'hui/Total sur la page compteur (affichage seul, +/- touche toujours la vraie valeur).
- `src/components/PieProgress.tsx` — anneau de progression `value/goal` en SVG (`react-native-svg`, module Expo Go officiel — fonctionne sans Development Build), inspiré du donut chart des captures de référence.
- `src/components/BarProgress.tsx` — barre de progression linéaire (pure `View`), utilisée sur la page Défi.
- `src/components/GoalModal.tsx` — définir/modifier/retirer l'objectif d'un compteur.
- `src/utils/goal.ts` — ratio et formatage `value/goal` (`progressRatio`, `clampedProgress`, `formatGoalFraction`, `formatGoalPercent`).
- `src/utils/period.ts` — ajout de `computeTodayValue()` (somme des variations depuis minuit).

### Composants et utilitaires ajoutés en v4 (défi quotidien + heatmap)

- `src/components/DailyChallengeModal.tsx` — active/désactive le défi quotidien et règle son objectif (`dailyGoal` reste mémorisé même désactivé).
- `src/components/Heatmap.tsx` — grille type "graphique de contributions GitHub" (colonnes = semaines, cases = jours), colorée par `value/dailyGoal` si un défi quotidien existe, sinon par intensité relative (repli qui reste utile sans défi actif).
- `src/utils/heatmap.ts` — `computeHeatmapDays()` construit la grille à partir de `groupHistoryByDay()` (déjà utilisé par le calendrier) — aucune donnée dupliquée.
- `ViewModeToggle` (Aujourd'hui/Total, v3) est réutilisé tel quel comme sélecteur unique pour le défi quotidien : pas de second toggle. "Aujourd'hui" affiche l'anneau contre `dailyGoal` (si le défi est actif), "Total" affiche l'anneau contre `goal` (objectif global, inchangé).

### Composants et utilitaires ajoutés en v5 (archive + stats de défi)

- `src/components/StatTile.tsx` — tuile statistique extraite de la page Stats compteur pour être partagée avec la nouvelle page Stats défi.
- `src/utils/listStats.ts` — `computeListStats()` : nombre de compteurs actifs, somme, moyenne, min/max sur l'ensemble des compteurs d'une liste.
- `Counter.archivedAt` / `CounterList.archivedAt` — archivage logique (`null` = actif). Archiver une liste cascade sur ses compteurs actifs ; les restaurer se fait indépendamment. Tous les sélecteurs "actifs" (`getListsSorted`, `getCountersForList`, `getListTotals`, `getCountersWithGoals`) excluent désormais l'archivé ; `getArchivedLists`/`getArchivedCounters` exposent l'inverse.

## Modèle de données (`src/store/types.ts`)

```ts
CounterList    { id, name, order, createdAt, newCounterAtTop, hideSumAndAverage, archivedAt }
Counter        { id, listId, name, value, step, order, createdAt, resetAt, lastClickAt, goal, dailyChallenge, archivedAt }
DailyChallenge { enabled, dailyGoal }
HistoryEntry   { id, counterId, delta, value, timestamp(ms), source }
AppSettings    { theme, hapticsOnTap, showMinusButton, volumeButtonsEnabled, keepScreenAwake }
```

`Counter.goal` porte l'objectif global optionnel : `null` = pas d'objectif,
sinon un entier positif. `Counter.dailyChallenge` porte le défi quotidien
(v4) : `dailyGoal` reste mémorisé même quand `enabled` passe à `false`, pour
ne pas avoir à ressaisir la valeur en réactivant. Aucun horodatage/état de
reset à stocker — la progression du jour se calcule à la volée depuis
`HistoryEntry[]` (`computeTodayValue`), donc le "reset à minuit" est
automatique et sans job à maintenir.

`HistoryEntry` porte un timestamp en millisecondes (précision seconde à
l'affichage) et une valeur "après coup" (`value`), ce qui permet de dériver
directement : total/moyenne par période, graphique d'évolution, vue
calendrier (regroupement par jour via `dayKey()`), et le mode Challenge
(comparaison `value` vs `goal`) — sans changer le schéma plus tard.

## Store (`src/store/useCounterStore.ts`)

Un seul store Zustand centralisé, persistant automatiquement `lists`,
`counters`, `history`, `settings` dans AsyncStorage (clé
`compteur-app-storage`). Actions **[MVP]** : `addList`, `renameList`,
`removeList`, `toggleNewCounterAtTop`, `addCounter`, `renameCounter`,
`removeCounter`, `setCounterStep`, `incrementCounter`, `decrementCounter`,
`resetCounter`, `updateSettings`, `setCounterGoal` (v3), `updateDailyChallenge`
(v4), `archiveList`/`restoreList`/`archiveCounter`/`restoreCounter` (v5),
plus des sélecteurs dérivés (`getListsSorted`, `getCountersForList`,
`getHistoryForCounter`, `getListTotals`, `getCountersWithGoals` (v3),
`getArchivedLists`/`getArchivedCounters` (v5)).

Depuis v5, `removeList`/`removeCounter` sont des primitives de **suppression
définitive** — elles ne sont plus appelées directement depuis les écrans
liste/compteur (qui archivent désormais via `archiveList`/`archiveCounter`),
seulement depuis l'écran Archive.

**Migration de schéma** : le store est versionné (`persist({ version, migrate })`).
Chaque champ ajouté à un objet déjà persisté (ex. `dailyChallenge` en v4,
`archivedAt` en v5) passe par une fonction `migrate` qui complète les
listes/compteurs déjà sauvegardés (usage réel en cours) plutôt que de risquer
un crash au premier lancement après mise à jour — à reproduire pour tout futur
champ du même genre.

Le pas d'incrément (`step`) est un champ persistant du compteur : on le
change une fois via le sélecteur (presets +1/+2/+5/+10/+25/+50/+100 ou valeur
libre), et chaque appui suivant (bouton écran **ou** volume) applique cette
valeur jusqu'au prochain changement — pas de choix à chaque clic.

## Boutons de volume ⚠️

Capturer les touches de volume matérielles nécessite un module natif tiers
(`react-native-volume-manager`, déjà installé). **Ce module ne fonctionne pas
dans Expo Go** — seuls les modules embarqués par l'équipe Expo y sont
disponibles. Il faut un **Development Build** (voir `eas.json`, profil
`development`) : un APK que tu installes une fois à la place d'Expo Go,
ensuite le flux `expo start` / hot reload reste identique.

`src/hooks/useVolumeButtons.ts` recentre le volume système à 50 % et détecte
si l'appui suivant le fait monter/descendre ; il échoue silencieusement (try/
catch) si le module natif est absent, donc l'app reste 100 % utilisable dans
Expo Go avec seulement les boutons à l'écran.

**Anti-rebond (v5)** : Android peut émettre le broadcast système
`VOLUME_CHANGED_ACTION` deux fois pour une seule pression physique sur
certains appareils — comportement natif hors de notre contrôle (vérifié :
pas d'abonnement JS dupliqué, le receiver natif a son propre garde-fou). Un
évènement dans la même direction survenant moins de 300ms après le précédent
est ignoré, pour garantir un seul incrément par pression.

## EAS Build (`eas.json`)

- `development` — Development Client (APK interne), avec les boutons volume actifs. À utiliser pour développer/tester en Codespace + téléphone.
- `preview` — APK autonome (sans dev client), à installer/partager directement. **[demandé]**
- `production` — App Bundle (`.aab`), pour une soumission Play Store future.

Commandes (`npx eas login` une première fois, puis) :
```
npm run build:dev        # APK dev client (boutons volume)
npm run build:preview    # APK autonome
```

## Périmètre livré

**MVP (v1)** : plusieurs listes de compteurs, ajout via "+", total/moyenne par
liste, +/- avec pas réglable (presets + valeur libre), boutons de volume
(Development Build), historique horodaté, persistance locale.

**v2 (cette itération)** :
- Historique : filtres de période (Quotidien/7j/30j/90j/Mensuel/Tout), message d'état vide adapté à la période
- Calendrier mensuel : total du jour sur chaque date, navigation mois précédent/suivant, détail des clics au tap sur un jour
- Statistiques par compteur : score, nombre de clics, min/max, moyenne par minute/heure/jour, création/reset/dernier clic, graphique d'évolution (barres quotidiennes, période sélectionnable)
- Marge de sécurité (`useSafeAreaInsets`) en bas des écrans liste, compteur et historique/calendrier/stats, pour ne pas passer sous la barre de navigation du téléphone

**v3** :
- Toggle "Aujourd'hui" / "Total" sur la page compteur : affichage seul (calculé depuis l'historique), les boutons +/- continuent d'incrémenter la vraie valeur totale dans tous les cas.
- Système d'objectif (`goal`, optionnel, modifiable/retirable à tout moment) : anneau de progression SVG sur la page compteur, barre de progression linéaire sur la nouvelle page Défi (tous les compteurs ayant un objectif, toutes listes confondues). Un compteur sans objectif n'affiche ni l'un ni l'autre.

**v4** :
- Défi quotidien par compteur (`dailyChallenge`, activable, objectif modifiable/désactivable sans perte de valeur) : la vue "Aujourd'hui" du toggle existant (v3) affiche l'anneau de progression contre l'objectif du jour au lieu de la valeur brute. Aucun mécanisme de reset : la progression se recalcule depuis l'historique à chaque rendu.
- Heatmap type GitHub sur la page Statistiques ("Assiduité") : coloration par `value/dailyGoal` si un défi quotidien existe, repli en intensité d'activité relative sinon.

**v5 (cette itération)** :
- **Fix prioritaire** : le bouton volume incrémentait de +2 au lieu de +1 (anti-rebond 300ms, cause = comportement natif Android, pas un abonnement dupliqué).
- Archive pour défis (listes) et compteurs : suppression = archivage (réversible) plutôt qu'effacement immédiat. Écran dédié pour restaurer ou supprimer définitivement. Archiver un défi cascade sur ses compteurs actifs.
- Statistiques par défi (`list/[listId]/stats.tsx`) : nombre de compteurs actifs, somme, moyenne, min/max, détail par compteur.
- Page "Objectifs" (ex-"Défi", renommée pour éviter la collision de vocabulaire avec "défi = liste").

### Non traité dans cette itération (à trancher plus tard)

La page Objectifs (`challenge.tsx`) ne liste que les compteurs à objectif
**global** (`goal`) — les compteurs en défi quotidien seul n'y apparaissent
pas encore. Ajouter la progression du jour à cette page (probablement avec
un badge distinguant "objectif global" / "défi du jour") reste un candidat
pour une itération suivante.

## Ordre de priorité pour la suite

1. **Menu contextuel** (export CSV, anecdotes sur les nombres, partage, noter l'app) — regroupe plusieurs petites fonctionnalités indépendantes derrière une même UI (`ActionSheet`), mais chacune ajoute une dépendance : `expo-sharing` + `expo-file-system` pour le CSV/partage, un appel réseau (ex. Numbers API) pour les anecdotes.
2. **Écran Paramètres** — le plus gros en surface (une quinzaine de réglages) mais le moins structurant : chaque toggle est indépendant et vient étendre `AppSettings`/`CounterList` sans dépendre des autres. Peut se construire en plusieurs passes (affichage → comportement → écran/vibrations) sans bloquer le reste.

Cet ordre suit la même logique que pour le MVP : d'abord ce qui consomme les
données déjà en place (historique/calendrier/stats, puis toggle/objectifs/défi
quotidien), ensuite ce qui ajoute de nouvelles dépendances externes (menu
contextuel), et enfin la surface de configuration la plus large mais la plus
indépendante (réglages).
