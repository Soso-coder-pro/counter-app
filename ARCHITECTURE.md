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
  challenge.tsx                      [v3]  Page Défi : tous les compteurs ayant un objectif, barre de progression

  # Itérations suivantes (non codées, mais compatibles avec le modèle de données actuel) :
  list/[listId]/settings.tsx         Réglages spécifiques à la liste (tri, affichage)
  settings/index.tsx                 Paramètres globaux (thème, langue, vibrations, écran…)
  settings/quick-add.tsx             Barre d'ajout rapide de compteur
```

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

## Modèle de données (`src/store/types.ts`)

```ts
CounterList  { id, name, order, createdAt, newCounterAtTop, hideSumAndAverage }
Counter      { id, listId, name, value, step, order, createdAt, resetAt, lastClickAt, goal }
HistoryEntry { id, counterId, delta, value, timestamp(ms), source }
AppSettings  { theme, hapticsOnTap, showMinusButton, volumeButtonsEnabled, keepScreenAwake }
```

`Counter.goal` (déjà présent depuis le MVP, non exploité jusqu'ici) porte
l'objectif optionnel : `null` = pas d'objectif, sinon un entier positif. La
page compteur et la page Défi lisent directement `value` vs `goal` — aucun
état dérivé à maintenir séparément.

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
`resetCounter`, `updateSettings`, `setCounterGoal` (v3), plus des sélecteurs
dérivés (`getListsSorted`, `getCountersForList`, `getHistoryForCounter`,
`getListTotals`, `getCountersWithGoals` (v3)).

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

**v3 (cette itération)** :
- Toggle "Aujourd'hui" / "Total" sur la page compteur : affichage seul (calculé depuis l'historique), les boutons +/- continuent d'incrémenter la vraie valeur totale dans tous les cas.
- Système d'objectif (`goal`, optionnel, modifiable/retirable à tout moment) : anneau de progression SVG sur la page compteur, barre de progression linéaire sur la nouvelle page Défi (tous les compteurs ayant un objectif, toutes listes confondues). Un compteur sans objectif n'affiche ni l'un ni l'autre.

## Ordre de priorité pour la suite

1. **Menu contextuel** (export CSV, anecdotes sur les nombres, partage, noter l'app) — regroupe plusieurs petites fonctionnalités indépendantes derrière une même UI (`ActionSheet`), mais chacune ajoute une dépendance : `expo-sharing` + `expo-file-system` pour le CSV/partage, un appel réseau (ex. Numbers API) pour les anecdotes.
2. **Écran Paramètres** — le plus gros en surface (une quinzaine de réglages) mais le moins structurant : chaque toggle est indépendant et vient étendre `AppSettings`/`CounterList` sans dépendre des autres. Peut se construire en plusieurs passes (affichage → comportement → écran/vibrations) sans bloquer le reste.

Cet ordre suit la même logique que pour le MVP : d'abord ce qui consomme les
données déjà en place (historique/calendrier/stats, puis toggle/objectifs),
ensuite ce qui ajoute de nouvelles dépendances externes (menu contextuel), et
enfin la surface de configuration la plus large mais la plus indépendante
(réglages).
