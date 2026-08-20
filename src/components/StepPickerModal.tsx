import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { STEP_PRESETS } from '../store/useCounterStore';
import { useTheme } from '../theme/colors';

interface StepPickerModalProps {
  visible: boolean;
  currentStep: number;
  onCancel: () => void;
  onSelect: (step: number) => void;
}

/**
 * Réglage de la valeur d'incrément d'un compteur : presets rapides + saisie libre.
 * Une fois validé, chaque appui +/- (écran ou volume) applique cette valeur
 * jusqu'au prochain changement.
 */
export function StepPickerModal({ visible, currentStep, onCancel, onSelect }: StepPickerModalProps) {
  const colors = useTheme();
  const [custom, setCustom] = useState(String(currentStep));

  useEffect(() => {
    if (visible) setCustom(String(currentStep));
  }, [visible, currentStep]);

  const customValue = parseInt(custom, 10);
  const customValid = Number.isFinite(customValue) && customValue > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Valeur d'incrément</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Chaque appui sur +/- (ou bouton volume) ajoutera cette valeur.
          </Text>

          <View style={styles.presetGrid}>
            {STEP_PRESETS.map((preset) => {
              const active = preset === currentStep;
              return (
                <Pressable
                  key={preset}
                  onPress={() => onSelect(preset)}
                  style={[
                    styles.preset,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  <Text style={{ color: active ? '#FFFFFF' : colors.text, fontWeight: '600' }}>+{preset}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.subtitle, { color: colors.subtext, marginTop: 16 }]}>Valeur personnalisée</Text>
          <View style={styles.customRow}>
            <TextInput
              value={custom}
              onChangeText={setCustom}
              keyboardType="number-pad"
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            />
            <Pressable
              disabled={!customValid}
              onPress={() => onSelect(customValue)}
              style={[styles.applyButton, { backgroundColor: customValid ? colors.primary : colors.border }]}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>OK</Text>
            </Pressable>
          </View>

          <Pressable style={styles.cancel} onPress={onCancel}>
            <Text style={{ color: colors.subtext }}>Fermer</Text>
          </Pressable>
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
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  preset: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  customRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  applyButton: {
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  cancel: {
    alignSelf: 'center',
    marginTop: 18,
  },
});
