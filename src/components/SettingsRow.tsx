import { StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '../theme/colors';

interface SettingsRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** Ligne de réglage "libellé + switch", réutilisée dans tout l'écran Paramètres. */
export function SettingsRow({ label, description, value, onValueChange }: SettingsRowProps) {
  const colors = useTheme();
  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      <View style={styles.textBlock}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {description && <Text style={[styles.description, { color: colors.subtext }]}>{description}</Text>}
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  textBlock: { flex: 1 },
  label: { fontSize: 15, fontWeight: '600' },
  description: { fontSize: 12, marginTop: 3, lineHeight: 16 },
});
