import { ScrollView, Pressable, StyleSheet, Text } from 'react-native';

import { PERIOD_OPTIONS, type HistoryPeriod } from '../utils/period';
import { useTheme } from '../theme/colors';

interface PeriodFilterProps {
  value: HistoryPeriod;
  onChange: (period: HistoryPeriod) => void;
}

/** Sélecteur horizontal Quotidien / 7j / 30j / 90j / Mensuel / Tout. */
export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const colors = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {PERIOD_OPTIONS.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[
              styles.chip,
              {
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary : 'transparent',
              },
            ]}
          >
            <Text style={{ color: active ? '#FFFFFF' : colors.text, fontWeight: '600', fontSize: 13 }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
});
