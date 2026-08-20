import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../theme/colors';

interface PromptModalProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onSubmit: (value: string) => void;
}

/** Modal générique "saisir un nom" — utilisé pour créer/renommer une liste ou un compteur. */
export function PromptModal({
  visible,
  title,
  placeholder,
  initialValue = '',
  confirmLabel = 'Valider',
  onCancel,
  onSubmit,
}: PromptModalProps) {
  const colors = useTheme();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={colors.subtext}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            autoFocus
            onSubmitEditing={() => value.trim() && onSubmit(value)}
            returnKeyType="done"
          />
          <View style={styles.row}>
            <Pressable style={styles.button} onPress={onCancel}>
              <Text style={{ color: colors.subtext }}>Annuler</Text>
            </Pressable>
            <Pressable
              style={styles.button}
              disabled={!value.trim()}
              onPress={() => onSubmit(value)}
            >
              <Text style={{ color: value.trim() ? colors.primary : colors.subtext, fontWeight: '600' }}>
                {confirmLabel}
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
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 20,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
