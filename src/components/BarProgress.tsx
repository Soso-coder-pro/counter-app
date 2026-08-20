import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/colors';
import { clampedProgress } from '../utils/goal';

interface BarProgressProps {
  value: number;
  goal: number;
  height?: number;
}

/** Barre de progression linéaire value/goal — utilisée sur la page Défi. */
export function BarProgress({ value, goal, height = 10 }: BarProgressProps) {
  const colors = useTheme();
  const progress = clampedProgress(value, goal);

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: colors.border }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${progress * 100}%`,
            height,
            borderRadius: height / 2,
            backgroundColor: colors.primary,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: {},
});
