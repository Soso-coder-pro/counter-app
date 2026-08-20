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
  counter/[counterId]/history.tsx    [MVP] Historique horodaté (simple, sans filtres)

  # Itérations suivantes (non codées, mais compatibles avec le modèle de données actuel) :
  counter/[counterId]/stats.tsx      Statistiques (min/max, moyenne/min-h-j, graphique, challenge)
  counter/[counterId]/calendar.tsx   Vue calendrier mensuelle (total du jour par date)
  list/[listId]/settings.tsx         Réglages spécifiques à la liste (tri, affichage)
  settings/index.tsx                 Paramètres globaux (thème, langue, vibrations, écran…)
  settings/quick-add.tsx             Barre d'ajout rapide de compteur
```

Menu contextuel (export CSV, anecdotes, partage, traduire/noter) : sera un
composant `ActionSheet`/`Menu` réutilisable branché sur les écrans liste et
compteur, une fois le MVP validé — pas d'écran dédié nécessaire.

## Modèle de données (`src/store/types.ts`)

```ts
CounterList  { id, name, order, createdAt, newCounterAtTop, hideSumAndAverage }
Counter      { id, listId, name, value, step, order, createdAt, resetAt, lastClickAt, goal }
HistoryEntry { id, counterId, delta, value, timestamp(ms), source }
AppSettings  { theme, hapticsOnTap, showMinusButton, volumeButtonsEnabled, keepScreenAwake }
```

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
`resetCounter`, `updateSettings`, plus des sélecteurs dérivés (`getListsSorted`,
`getCountersForList`, `getHistoryForCounter`, `getListTotals`).

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

## Périmètre du MVP livré

- Plusieurs listes de compteurs, création via "+"
- Ajout de compteurs dans une liste via "+", option "nouveau compteur en haut"
- Total / moyenne par liste (masquable via `hideSumAndAverage`, pas encore d'UI dédiée — champ prêt)
- Incrémentation/décrémentation par boutons écran, pas réglable à tout moment (presets + valeur libre)
- Boutons de volume (nécessite le Development Build EAS)
- Historique horodaté simple (liste chronologique, sans filtres de période ni calendrier)
- Persistance locale (AsyncStorage) — les données survivent au redémarrage de l'app

### Reporté aux itérations suivantes

Tri/glisser-déposer des compteurs, masquer bouton "-", filtres de période
(7/30/90j, mensuel), vue calendrier, statistiques avancées + graphique, mode
Challenge, menu contextuel (CSV, anecdotes, partage, traduire/noter), écran
Paramètres complet (langue, thème manuel, taille des compteurs/texte, mode
compact, verrouillage auto, écran allumé, compte à rebours, etc.).
