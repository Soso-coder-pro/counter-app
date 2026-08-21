import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import type { DailyChallenge } from '../store/types';
import { useTheme } from '../theme/colors';

interface DailyChallengeModalProps {
  visible: boolean;
  current: DailyChallenge;
  onCancel: () => void;
  onSubmit: (patch: Partial<DailyChallenge>) => void;
}

/** Active/désactive le défi quotidien et règle son objectif. */
export function DailyChallengeModal({ visible, current, onCancel, onSubmit }: DailyChallengeModalProps) {
  const colors = useTheme();
  const [enabled, setEnabled] = useState(current.enabled);
  const [value, setValue] = useState(current.dailyGoal ? String(current.dailyGoal) : '');

  useEffect(() => {
    if (visible) {
      setEnabled(current.enabled);
      setValue(current.dailyGoal ? String(current.dailyGoal) : '');
    }
  }, [visible, current]);

  const parsed = parseInt(value, 10);
  const valid = Number.isFinite(parsed) && parsed > 0;

  function handleSubmit() {
    onSubmit({ enabled: enabled && valid, dailyGoal: valid ? parsed : current.dailyGoal });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.row}>
            <Text style={[styles.title, { color: colors.text }]}>Défi quotidien</Text>
            <Switch value={enabled} onValueChange={setEnabled} />
          </View>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Une fois activé, la vue "Aujourd'hui" affiche la progression du jour par rapport à cet objectif — le
            compteur repart naturellement à 0 chaque jour à minuit, sans toucher au total réel.
          </Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            keyboardType="number-pad"
            placeholder="Ex : 100"
            placeholderTextColor={colors.subtext}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            autoFocus={!current.enabled}
          />

          <View style={styles.actionsRow}>
            <Pressable style={styles.button} onPress={onCancel}>
              <Text style={{ color: colors.subtext }}>Annuler</Text>
            </Pressable>
            <Pressable style={styles.button} disabled={enabled && !valid} onPress={handleSubmit}>
              <Text style={{ color: enabled && !valid ? colors.subtext : colors.primary, fontWeight: '600' }}>
                Valider
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: { width: '100%', maxWidth: 400, borderRadius: 16, padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 17, fontWeight: '600' },
  subtitle: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 14,
  },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 20 },
  button: { paddingVertical: 8, paddingHorizontal: 4 },
});
