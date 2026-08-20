import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../theme/colors';

interface GoalModalProps {
  visible: boolean;
  currentGoal: number | null;
  onCancel: () => void;
  onSubmit: (goal: number | null) => void;
}

/** Définit, modifie ou retire l'objectif (goal) d'un compteur. */
export function GoalModal({ visible, currentGoal, onCancel, onSubmit }: GoalModalProps) {
  const colors = useTheme();
  const [value, setValue] = useState(currentGoal ? String(currentGoal) : '');

  useEffect(() => {
    if (visible) setValue(currentGoal ? String(currentGoal) : '');
  }, [visible, currentGoal]);

  const parsed = parseInt(value, 10);
  const valid = Number.isFinite(parsed) && parsed > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Objectif</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Une fois atteint, la progression s'affiche sur cette page et sur la page Défi.
          </Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            keyboardType="number-pad"
            placeholder="Ex : 600"
            placeholderTextColor={colors.subtext}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            autoFocus
          />

          <View style={styles.row}>
            {currentGoal !== null && (
              <Pressable style={styles.button} onPress={() => onSubmit(null)}>
                <Text style={{ color: colors.danger }}>Retirer l'objectif</Text>
              </Pressable>
            )}
            <View style={{ flex: 1 }} />
            <Pressable style={styles.button} onPress={onCancel}>
              <Text style={{ color: colors.subtext }}>Annuler</Text>
            </Pressable>
            <Pressable style={styles.button} disabled={!valid} onPress={() => onSubmit(parsed)}>
              <Text style={{ color: valid ? colors.primary : colors.subtext, fontWeight: '600' }}>Valider</Text>
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
  title: { fontSize: 17, fontWeight: '600' },
  subtitle: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 16 },
  button: { paddingVertical: 8, paddingHorizontal: 2 },
});
