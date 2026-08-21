import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/colors';
import { computeHeatmapDays } from '../utils/heatmap';
import type { HistoryEntry } from '../store/types';

interface HeatmapProps {
  history: HistoryEntry[];
  dailyGoal: number | null;
  weeks?: number;
}

const CELL_SIZE = 13;
const CELL_GAP = 3;

/** Heatmap type "graphique de contributions GitHub" — une colonne par semaine, une case par jour. */
export function Heatmap({ history, dailyGoal, weeks = 18 }: HeatmapProps) {
  const colors = useTheme();
  const days = computeHeatmapDays(history, dailyGoal, weeks);

  // Regroupe en colonnes de 7 (lundi -> dimanche).
  const columns: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7));

  function colorForLevel(level: 0 | 1 | 2 | 3 | 4): string {
    if (level === 0) return colors.border;
    // Opacité croissante de la couleur primaire du thème (25% -> 100%).
    const opacities = ['40', '70', 'A0', 'FF'];
    return `${colors.primary}${opacities[level - 1]}`;
  }

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {columns.map((column, colIndex) => (
            <View key={colIndex} style={styles.column}>
              {column.map((day) => (
                <View
                  key={day.dateKey}
                  style={[styles.cell, { backgroundColor: colorForLevel(day.level) }]}
                  accessibilityLabel={`${day.dateKey} : ${day.value}`}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.legendRow}>
        <Text style={[styles.legendLabel, { color: colors.subtext }]}>Moins</Text>
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <View key={level} style={[styles.cell, { backgroundColor: colorForLevel(level) }]} />
        ))}
        <Text style={[styles.legendLabel, { color: colors.subtext }]}>Plus</Text>
      </View>
      <Text style={[styles.hint, { color: colors.subtext }]}>
        {dailyGoal
          ? `Coloré selon l'objectif quotidien (${dailyGoal})`
          : "Coloré selon l'activité relative (pas de défi quotidien défini)"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingVertical: 4 },
  grid: { flexDirection: 'row', gap: CELL_GAP },
  column: { gap: CELL_GAP },
  cell: { width: CELL_SIZE, height: CELL_SIZE, borderRadius: 3 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  legendLabel: { fontSize: 11, marginHorizontal: 4 },
  hint: { fontSize: 12, marginTop: 8 },
});
