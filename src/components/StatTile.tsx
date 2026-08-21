import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/colors';

/** Tuile statistique (valeur + libellé), réutilisée sur les pages Stats compteur et Stats défi. */
export function StatTile({ label, value }: { label: string; value: string }) {
  const colors = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.tileValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: colors.subtext }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '31%',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tileValue: { fontSize: 20, fontWeight: '700' },
  tileLabel: { fontSize: 11, marginTop: 4, textAlign: 'center' },
});
