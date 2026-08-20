import { StyleSheet, Text, View } from 'react-native';

import type { HistoryEntry } from '../store/types';
import { useTheme } from '../theme/colors';
import { formatDateTime } from '../utils/date';

export const SOURCE_LABEL: Record<HistoryEntry['source'], string> = {
  'button-plus': 'bouton +',
  'button-minus': 'bouton −',
  'volume-up': 'volume ↑',
  'volume-down': 'volume ↓',
  manual: 'manuel',
};

/** Une ligne d'historique : date/heure précise à la seconde + variation + valeur résultante. */
export function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const colors = useTheme();
  const positive = entry.delta >= 0;
  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      <Text style={[styles.date, { color: colors.text }]}>{formatDateTime(entry.timestamp)}</Text>
      <View style={styles.rowRight}>
        <Text style={{ color: colors.subtext, fontSize: 12 }}>{SOURCE_LABEL[entry.source]}</Text>
        <Text style={[styles.delta, { color: positive ? colors.primary : colors.danger }]}>
          {positive ? '+' : ''}
          {entry.delta} → {entry.value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
