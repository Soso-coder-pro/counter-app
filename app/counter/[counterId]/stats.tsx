import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { Heatmap } from '../../../src/components/Heatmap';
import { MiniBarChart } from '../../../src/components/MiniBarChart';
import { PeriodFilter } from '../../../src/components/PeriodFilter';
import { useCounterStore } from '../../../src/store/useCounterStore';
import { useTheme } from '../../../src/theme/colors';
import { buildDailySeries } from '../../../src/utils/chart';
import { formatDateTime } from '../../../src/utils/date';
import type { HistoryPeriod } from '../../../src/utils/period';
import { computeCounterStats, formatRate } from '../../../src/utils/stats';

function StatTile({ label, value }: { label: string; value: string }) {
  const colors = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.tileValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: colors.subtext }]}>{label}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const { counterId } = useLocalSearchParams<{ counterId: string }>();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const counter = useCounterStore((s) => s.counters.find((c) => c.id === counterId));
  const history = useCounterStore(useShallow((s) => (counterId ? s.getHistoryForCounter(counterId) : [])));
  const [period, setPeriod] = useState<HistoryPeriod>('30d');

  const stats = useMemo(() => (counter ? computeCounterStats(counter, history) : null), [counter, history]);
  const series = useMemo(() => buildDailySeries(history, period), [history, period]);

  if (!counter || !stats) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.subtext }}>Compteur introuvable.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
    >
      <Stack.Screen options={{ title: `Statistiques · ${counter.name}` }} />

      <View style={styles.grid}>
        <StatTile label="Score actuel" value={String(stats.currentValue)} />
        <StatTile label="Nombre de clics" value={String(stats.clicksCount)} />
        <StatTile label="Minimum" value={String(stats.min)} />
        <StatTile label="Maximum" value={String(stats.max)} />
        <StatTile label="Moyenne / minute" value={formatRate(stats.perMinute)} />
        <StatTile label="Moyenne / heure" value={formatRate(stats.perHour)} />
        <StatTile label="Moyenne / jour" value={formatRate(stats.perDay)} />
      </View>

      <View style={styles.datesBlock}>
        <View style={styles.dateRow}>
          <Text style={[styles.dateLabel, { color: colors.subtext }]}>Créé le</Text>
          <Text style={[styles.dateValue, { color: colors.text }]}>{formatDateTime(stats.createdAt)}</Text>
        </View>
        <View style={styles.dateRow}>
          <Text style={[styles.dateLabel, { color: colors.subtext }]}>Dernière réinitialisation</Text>
          <Text style={[styles.dateValue, { color: colors.text }]}>
            {stats.resetAt ? formatDateTime(stats.resetAt) : '—'}
          </Text>
        </View>
        <View style={styles.dateRow}>
          <Text style={[styles.dateLabel, { color: colors.subtext }]}>Dernier clic</Text>
          <Text style={[styles.dateValue, { color: colors.text }]}>
            {stats.lastClickAt ? formatDateTime(stats.lastClickAt) : '—'}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Évolution</Text>
      <PeriodFilter value={period} onChange={setPeriod} />
      <View style={styles.chartWrap}>
        <MiniBarChart data={series} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Assiduité</Text>
      <View style={styles.chartWrap}>
        <Heatmap history={history} dailyGoal={counter.dailyChallenge.enabled ? counter.dailyChallenge.dailyGoal : null} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  tile: {
    width: '31%',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tileValue: { fontSize: 20, fontWeight: '700' },
  tileLabel: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  datesBlock: { paddingHorizontal: 16, marginTop: 8, gap: 8 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateLabel: { fontSize: 13 },
  dateValue: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginTop: 24 },
  chartWrap: { paddingHorizontal: 16, marginTop: 8 },
});
