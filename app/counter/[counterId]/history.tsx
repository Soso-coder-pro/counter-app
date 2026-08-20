import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { HistoryRow } from '../../../src/components/HistoryRow';
import { PeriodFilter } from '../../../src/components/PeriodFilter';
import type { HistoryEntry } from '../../../src/store/types';
import { useCounterStore } from '../../../src/store/useCounterStore';
import { useTheme } from '../../../src/theme/colors';
import { emptyMessageForPeriod, filterByPeriod, type HistoryPeriod } from '../../../src/utils/period';

export default function HistoryScreen() {
  const { counterId } = useLocalSearchParams<{ counterId: string }>();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const counter = useCounterStore((s) => s.counters.find((c) => c.id === counterId));
  const history = useCounterStore(useShallow((s) => (counterId ? s.getHistoryForCounter(counterId) : [])));
  const [period, setPeriod] = useState<HistoryPeriod>('all');

  const filtered = useMemo(() => filterByPeriod(history, period), [history, period]);

  function renderItem({ item }: { item: HistoryEntry }) {
    return <HistoryRow entry={item} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: counter ? `Historique · ${counter.name}` : 'Historique' }} />
      <PeriodFilter value={period} onChange={setPeriod} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: 16 + insets.bottom }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>{emptyMessageForPeriod(period)}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 16, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyText: { textAlign: 'center', fontSize: 15, lineHeight: 22 },
});
