import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useCounterStore } from '../src/store/useCounterStore';
import { useTheme } from '../src/theme/colors';
import { configureNotificationHandler, rescheduleReminders } from '../src/utils/notifications';

SplashScreen.preventAutoHideAsync().catch(() => {});

const KEEP_AWAKE_TAG = 'compteur-keep-awake';

export default function RootLayout() {
  const hasHydrated = useCounterStore((s) => s.hasHydrated);
  const keepScreenAwake = useCounterStore((s) => s.settings.keepScreenAwake);
  const notificationsEnabled = useCounterStore((s) => s.settings.notifications.enabled);
  const notificationTimes = useCounterStore((s) => s.settings.notifications.times);
  const colors = useTheme();

  useEffect(() => {
    if (hasHydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hasHydrated]);

  // L'écran reste allumé tant que l'app est au premier plan (comportement
  // natif de expo-keep-awake — il n'y a rien à faire pour l'arrière-plan).
  useEffect(() => {
    if (keepScreenAwake) {
      activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    } else {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    }
  }, [keepScreenAwake]);

  useEffect(() => {
    configureNotificationHandler();
  }, []);

  // Reprogrammé à chaque changement de réglage (et au démarrage) — voir
  // src/utils/notifications.ts pour les limites (rappel générique, pas de
  // décompte dynamique).
  useEffect(() => {
    rescheduleReminders(notificationsEnabled, notificationTimes);
  }, [notificationsEnabled, notificationTimes]);

  if (!hasHydrated) return null;

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Compteur' }} />
        <Stack.Screen name="challenge" options={{ title: 'Objectifs' }} />
        <Stack.Screen name="archive" options={{ title: 'Archive' }} />
        <Stack.Screen name="settings" options={{ title: 'Paramètres' }} />
        <Stack.Screen name="list/[listId]/index" options={{ title: '' }} />
        <Stack.Screen name="list/[listId]/stats" options={{ title: 'Statistiques' }} />
        <Stack.Screen name="counter/[counterId]/index" options={{ title: '' }} />
        <Stack.Screen name="counter/[counterId]/history" options={{ title: 'Historique' }} />
        <Stack.Screen name="counter/[counterId]/calendar" options={{ title: 'Calendrier' }} />
        <Stack.Screen name="counter/[counterId]/stats" options={{ title: 'Statistiques' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
