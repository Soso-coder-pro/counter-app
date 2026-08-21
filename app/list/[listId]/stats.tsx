import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { StatTile } from '../../../src/components/StatTile';
import type { Counter } from '../../../src/store/types';
import { useCounterStore } from '../../../src/store/useCounterStore';
import { useTheme } from '../../../src/theme/colors';
import { computeListStats } from '../../../src/utils/listStats';

export default function ListStatsScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const list = useCounterStore((s) => s.lists.find((l) => l.id === listId));
  const counters = useCounterStore(useShallow((s) => (listId ? s.getCountersForList(listId) : [])));

  const stats = useMemo(() => computeListStats(counters), [counters]);
  const ranked = useMemo(() => [...counters].sort((a, b) => b.value - a.value), [counters]);

  if (!list) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.subtext }}>Défi introuvable.</Text>
      </View>
    );
  }

  function renderRow(item: Counter) {
    return (
      <Link key={item.id} href={`/counter/${item.id}`} asChild>
        <Pressable style={StyleSheet.flatten([styles.row, { borderColor: colors.border }])}>
          <Text style={[styles.rowName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.rowValue, { color: colors.primary }]}>{item.value}</Text>
        </Pressable>
      </Link>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
    >
      <Stack.Screen options={{ title: `Statistiques · ${list.name}` }} />

      <View style={styles.grid}>
        <StatTile label="Compteurs actifs" value={String(stats.activeCount)} />
        <StatTile label="Somme totale" value={String(stats.sum)} />
        <StatTile label="Moyenne" value={stats.average.toFixed(1)} />
        <StatTile label="Minimum" value={String(stats.min)} />
        <StatTile label="Maximum" value={String(stats.max)} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Par compteur</Text>
      <View style={styles.listWrap}>
        {ranked.length > 0 ? (
          ranked.map(renderRow)
        ) : (
          <Text style={[styles.emptyText, { color: colors.subtext }]}>
            Aucun compteur actif dans ce défi pour l'instant.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginTop: 24 },
  listWrap: { paddingHorizontal: 16, marginTop: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowName: { fontSize: 15, flex: 1, marginRight: 12 },
  rowValue: { fontSize: 16, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 16 },
});
