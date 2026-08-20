import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { HistoryEntry } from '../../../src/store/types';
import { useCounterStore } from '../../../src/store/useCounterStore';
import { useTheme } from '../../../src/theme/colors';
import { formatDateTime } from '../../../src/utils/date';

const SOURCE_LABEL: Record<HistoryEntry['source'], string> = {
  'button-plus': 'bouton +',
  'button-minus': 'bouton −',
  'volume-up': 'volume ↑',
  'volume-down': 'volume ↓',
  manual: 'manuel',
};

export default function HistoryScreen() {
  const { counterId } = useLocalSearchParams<{ counterId: string }>();
  const colors = useTheme();
  const counter = useCounterStore((s) => s.counters.find((c) => c.id === counterId));
  const history = useCounterStore((s) => (counterId ? s.getHistoryForCounter(counterId) : []));

  function renderItem({ item }: { item: HistoryEntry }) {
    const positive = item.delta >= 0;
    return (
      <View style={[styles.row, { borderColor: colors.border }]}>
        <Text style={[styles.date, { color: colors.text }]}>{formatDateTime(item.timestamp)}</Text>
        <View style={styles.rowRight}>
          <Text style={{ color: colors.subtext, fontSize: 12 }}>{SOURCE_LABEL[item.source]}</Text>
          <Text style={[styles.delta, { color: positive ? colors.primary : colors.danger }]}>
            {positive ? '+' : ''}
            {item.delta} → {item.value}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: counter ? `Historique · ${counter.name}` : 'Historique' }} />
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              Aucun décompte enregistré pour cette période.{'\n'}Les clics apparaîtront ici avec leur horodatage.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowRight: { alignItems: 'flex-end' },
  date: { fontSize: 14 },
  delta: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyText: { textAlign: 'center', fontSize: 15, lineHeight: 22 },
});
