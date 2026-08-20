import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/colors';

export interface BarChartPoint {
  label: string;
  value: number;
}

interface MiniBarChartProps {
  data: BarChartPoint[];
  height?: number;
}

/**
 * Graphique en barres minimaliste (pas de dépendance native/SVG, uniquement
 * des <View> dimensionnées proportionnellement) — suffisant pour visualiser
 * une évolution dans le temps sans ajouter de lib de charts.
 */
export function MiniBarChart({ data, height = 120 }: MiniBarChartProps) {
  const colors = useTheme();

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={{ color: colors.subtext, fontSize: 13 }}>Pas encore assez de données.</Text>
      </View>
    );
  }

  const maxAbs = Math.max(1, ...data.map((d) => Math.abs(d.value)));
  // Espace labels tous les N barres pour éviter le chevauchement sur de grandes séries.
  const labelStep = Math.max(1, Math.ceil(data.length / 8));

  return (
    <View style={styles.container}>
      <View style={[styles.barsRow, { height }]}>
        {data.map((point, index) => {
          const barHeight = Math.max(2, (Math.abs(point.value) / maxAbs) * (height - 20));
          const negative = point.value < 0;
          return (
            <View key={`${point.label}-${index}`} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: negative ? colors.danger : colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        {data.map((point, index) => (
          <View key={`label-${point.label}-${index}`} style={styles.barColumn}>
            {index % labelStep === 0 && (
              <Text style={[styles.label, { color: colors.subtext }]} numberOfLines={1}>
                {point.label}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  empty: { alignItems: 'center', justifyContent: 'center' },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', width: '100%' },
  barColumn: { flex: 1, alignItems: 'center' },
  barTrack: { justifyContent: 'flex-end', alignItems: 'center', width: '100%' },
  bar: { width: '55%', borderRadius: 3, minWidth: 3 },
  labelsRow: { flexDirection: 'row', marginTop: 6 },
  label: { fontSize: 9, textAlign: 'center' },
});
