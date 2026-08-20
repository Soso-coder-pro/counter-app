import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../theme/colors';
import { clampedProgress, formatGoalPercent } from '../utils/goal';

interface PieProgressProps {
  value: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

/**
 * Anneau de progression value/goal (SVG) — inspiré du donut chart vu dans les
 * captures d'écran de référence (segment coloré sur fond clair, libellé au
 * centre). `react-native-svg` est un module Expo Go officiel : pas besoin de
 * Development Build pour ce composant.
 */
export function PieProgress({ value, goal, size = 140, strokeWidth = 16 }: PieProgressProps) {
  const colors = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = clampedProgress(value, goal);
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.center}>
          <Text style={[styles.percent, { color: colors.text }]}>{formatGoalPercent(value, goal)}</Text>
          <Text style={[styles.fraction, { color: colors.subtext }]}>
            {value}/{goal}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  percent: { fontSize: 20, fontWeight: '700' },
  fraction: { fontSize: 12, marginTop: 2 },
});
