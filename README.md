# Compteur

Application mobile de compteurs (React Native + Expo Router). Voir
[`ARCHITECTURE.md`](./ARCHITECTURE.md) pour le détail de l'architecture, du
modèle de données et de la feuille de route.

## Développer depuis un GitHub Codespace

```bash
npm install
npm start
```

`expo start` affiche un QR code dans le terminal. Comme le Codespace tourne
dans le cloud, utilise l'option **tunnel** si le LAN direct ne fonctionne pas :

```bash
npm start -- --tunnel
```

- **Expo Go (Android/iPad)** : scanne le QR code avec l'app Expo Go. Toutes
  les fonctionnalités marchent **sauf les boutons de volume physiques**
  (module natif non embarqué dans Expo Go — voir `ARCHITECTURE.md`).
- **Development Build** : pour tester les boutons volume, installe l'APK dev
  généré par `npm run build:dev` (une fois), puis relance `npm start` : le
  QR code s'ouvrira dans cette app-là au lieu d'Expo Go.

## Builder un APK avec EAS (sans PC)

```bash
npx eas login            # une seule fois, avec ton compte Expo
npm run build:preview    # APK autonome, installable directement
npm run build:dev        # APK Development Client (boutons volume)
```

Le build tourne sur les serveurs Expo — tu n'as besoin ni d'Android Studio ni
d'un PC. Une fois terminé, EAS donne un lien de téléchargement direct pour
l'APK (installable sur Android en autorisant les sources inconnues).

## Scripts

| Script | Description |
| --- | --- |
| `npm start` | Démarre le serveur de dev Expo |
| `npm run android` | Démarre et ouvre sur Android |
| `npm run typecheck` | Vérifie les types TypeScript |
| `npm run build:preview` | Build EAS — APK autonome |
| `npm run build:dev` | Build EAS — Development Client |
