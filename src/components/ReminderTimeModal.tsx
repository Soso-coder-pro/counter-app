import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../theme/colors';
import { isValidTime } from '../utils/notifications';

interface ReminderTimeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (time: string) => void;
}

/** Ajoute une heure de rappel au format "HH:MM". */
export function ReminderTimeModal({ visible, onCancel, onSubmit }: ReminderTimeModalProps) {
  const colors = useTheme();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible) setValue('');
  }, [visible]);

  const valid = isValidTime(value);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Nouvelle heure de rappel</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>Format 24h, ex : 20:00</Text>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="HH:MM"
            placeholderTextColor={colors.subtext}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            autoFocus
            onSubmitEditing={() => valid && onSubmit(value.trim())}
          />

          <View style={styles.row}>
            <Pressable style={styles.button} onPress={onCancel}>
              <Text style={{ color: colors.subtext }}>Annuler</Text>
            </Pressable>
            <Pressable style={styles.button} disabled={!valid} onPress={() => onSubmit(value.trim())}>
              <Text style={{ color: valid ? colors.primary : colors.subtext, fontWeight: '600' }}>Ajouter</Text>
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
  card: { width: '100%', maxWidth: 360, borderRadius: 16, padding: 20 },
  title: { fontSize: 17, fontWeight: '600' },
  subtitle: { fontSize: 13, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 14,
  },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 20 },
  button: { paddingVertical: 8, paddingHorizontal: 4 },
});
