import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useCounterStore } from '../src/store/useCounterStore';
import { useTheme } from '../src/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const hasHydrated = useCounterStore((s) => s.hasHydrated);
  const colors = useTheme();

  useEffect(() => {
    if (hasHydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hasHydrated]);

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
