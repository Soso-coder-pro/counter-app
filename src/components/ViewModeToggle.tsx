import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/colors';

export type CounterViewMode = 'today' | 'total';

interface ViewModeToggleProps {
  value: CounterViewMode;
  onChange: (mode: CounterViewMode) => void;
}

/** Segmented control "Aujourd'hui" / "Total" — n'affecte que l'affichage, pas la valeur réelle. */
export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  const colors = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {(['today', 'total'] as const).map((mode) => {
        const active = mode === value;
        return (
          <Pressable
            key={mode}
            onPress={() => onChange(mode)}
            style={[styles.segment, active && { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: active ? '#FFFFFF' : colors.subtext, fontWeight: '600', fontSize: 13 }}>
              {mode === 'today' ? "Aujourd'hui" : 'Total'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    padding: 3,
    alignSelf: 'center',
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
