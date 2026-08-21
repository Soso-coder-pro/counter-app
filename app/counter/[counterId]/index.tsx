import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { DailyChallengeModal } from '../../../src/components/DailyChallengeModal';
import { GoalModal } from '../../../src/components/GoalModal';
import { PieProgress } from '../../../src/components/PieProgress';
import { PromptModal } from '../../../src/components/PromptModal';
import { StepPickerModal } from '../../../src/components/StepPickerModal';
import { ViewModeToggle, type CounterViewMode } from '../../../src/components/ViewModeToggle';
import { useVolumeButtons } from '../../../src/hooks/useVolumeButtons';
import { useCounterStore } from '../../../src/store/useCounterStore';
import { useTheme } from '../../../src/theme/colors';
import { computeTodayValue } from '../../../src/utils/period';

export default function CounterScreen() {
  const { counterId } = useLocalSearchParams<{ counterId: string }>();
  const colors = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const counter = useCounterStore((s) => s.counters.find((c) => c.id === counterId));
  const settings = useCounterStore((s) => s.settings);
  const history = useCounterStore(useShallow((s) => (counterId ? s.getHistoryForCounter(counterId) : [])));
  const incrementCounter = useCounterStore((s) => s.incrementCounter);
  const decrementCounter = useCounterStore((s) => s.decrementCounter);
  const setCounterStep = useCounterStore((s) => s.setCounterStep);
  const setCounterGoal = useCounterStore((s) => s.setCounterGoal);
  const updateDailyChallenge = useCounterStore((s) => s.updateDailyChallenge);
  const resetCounter = useCounterStore((s) => s.resetCounter);
  const renameCounter = useCounterStore((s) => s.renameCounter);
  const removeCounter = useCounterStore((s) => s.removeCounter);

  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [dailyChallengeModalVisible, setDailyChallengeModalVisible] = useState(false);
  // Le défi quotidien, quand actif, ouvre l'écran directement sur la
  // progression du jour plutôt que sur le total.
  const [viewMode, setViewMode] = useState<CounterViewMode>(() =>
    counter?.dailyChallenge.enabled ? 'today' : 'total'
  );

  const todayValue = useMemo(() => computeTodayValue(history), [history]);

  function bump(direction: 1 | -1, source: 'button-plus' | 'button-minus' | 'volume-up' | 'volume-down') {
    if (!counterId) return;
    if (settings.hapticsOnTap) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (direction === 1) incrementCounter(counterId, source);
    else decrementCounter(counterId, source);
  }

  useVolumeButtons(
    () => bump(1, 'volume-up'),
    () => bump(-1, 'volume-down'),
    settings.volumeButtonsEnabled && !!counter
  );

  if (!counter || !counterId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.subtext }}>Compteur introuvable.</Text>
      </View>
    );
  }

  function confirmReset() {
    Alert.alert('Réinitialiser', `Remettre "${counter!.name}" à zéro ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Réinitialiser', style: 'destructive', onPress: () => resetCounter(counterId!) },
    ]);
  }

  function confirmDelete() {
    Alert.alert('Supprimer', `Supprimer définitivement "${counter!.name}" et son historique ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          removeCounter(counterId!);
          router.back();
        },
      },
    ]);
  }

  const displayedValue = viewMode === 'today' ? todayValue : counter.value;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 16 + insets.bottom }}
    >
      <Stack.Screen
        options={{
          title: counter.name,
          headerRight: () => (
            <Pressable onPress={() => setRenameModalVisible(true)}>
              <Text style={{ color: colors.primary, fontSize: 15 }}>Renommer</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.toggleWrap}>
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </View>

      <View style={styles.valueBlock}>
        <Text style={[styles.value, { color: colors.text }]}>{displayedValue}</Text>
        <Text style={[styles.viewModeLabel, { color: colors.subtext }]}>
          {viewMode === 'today' ? "Depuis minuit" : 'Depuis la création'}
        </Text>
        <Pressable onPress={() => setStepModalVisible(true)} style={styles.stepChip}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>pas : +{counter.step} ✎</Text>
        </Pressable>
        {settings.volumeButtonsEnabled && (
          <Text style={[styles.hint, { color: colors.subtext }]}>
            Astuce : les boutons de volume incrémentent/décrémentent aussi (nécessite un dev build EAS).
          </Text>
        )}
      </View>

      <View style={styles.goalBlock}>
        {viewMode === 'today' ? (
          counter.dailyChallenge.enabled && counter.dailyChallenge.dailyGoal !== null ? (
            <Pressable onPress={() => setDailyChallengeModalVisible(true)} style={styles.goalRing}>
              <PieProgress value={todayValue} goal={counter.dailyChallenge.dailyGoal} />
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600', marginTop: 8 }}>
                Défi du jour : {counter.dailyChallenge.dailyGoal} ✎
              </Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => setDailyChallengeModalVisible(true)}>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                + Activer le défi quotidien
              </Text>
            </Pressable>
          )
        ) : counter.goal !== null ? (
          <Pressable onPress={() => setGoalModalVisible(true)} style={styles.goalRing}>
            <PieProgress value={counter.value} goal={counter.goal} />
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600', marginTop: 8 }}>
              Objectif : {counter.goal} ✎
            </Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => setGoalModalVisible(true)}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>+ Définir un objectif</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.buttonsRow}>
        {settings.showMinusButton && (
          <Pressable
            style={[styles.roundButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => bump(-1, 'button-minus')}
            accessibilityLabel="Décrémenter"
          >
            <Text style={[styles.roundButtonText, { color: colors.text }]}>−</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.roundButton, styles.roundButtonPrimary, { backgroundColor: colors.primary }]}
          onPress={() => bump(1, 'button-plus')}
          accessibilityLabel="Incrémenter"
        >
          <Text style={[styles.roundButtonText, { color: '#FFFFFF' }]}>+</Text>
        </Pressable>
      </View>

      <View style={styles.footerActions}>
        <Pressable onPress={() => router.push(`/counter/${counterId}/history`)}>
          <Text style={{ color: colors.primary, fontSize: 15 }}>Historique</Text>
        </Pressable>
        <Pressable onPress={() => router.push(`/counter/${counterId}/calendar`)}>
          <Text style={{ color: colors.primary, fontSize: 15 }}>Calendrier</Text>
        </Pressable>
        <Pressable onPress={() => router.push(`/counter/${counterId}/stats`)}>
          <Text style={{ color: colors.primary, fontSize: 15 }}>Statistiques</Text>
        </Pressable>
      </View>

      <View style={[styles.footerActions, { marginTop: 20 }]}>
        <Pressable onPress={confirmReset}>
          <Text style={{ color: colors.subtext, fontSize: 15 }}>Réinitialiser</Text>
        </Pressable>
        <Pressable onPress={confirmDelete}>
          <Text style={{ color: colors.danger, fontSize: 15 }}>Supprimer</Text>
        </Pressable>
      </View>

      <StepPickerModal
        visible={stepModalVisible}
        currentStep={counter.step}
        onCancel={() => setStepModalVisible(false)}
        onSelect={(step) => {
          setCounterStep(counterId, step);
          setStepModalVisible(false);
        }}
      />

      <PromptModal
        visible={renameModalVisible}
        title="Renommer le compteur"
        initialValue={counter.name}
        confirmLabel="Enregistrer"
        onCancel={() => setRenameModalVisible(false)}
        onSubmit={(name) => {
          renameCounter(counterId, name);
          setRenameModalVisible(false);
        }}
      />

      <GoalModal
        visible={goalModalVisible}
        currentGoal={counter.goal}
        onCancel={() => setGoalModalVisible(false)}
        onSubmit={(goal) => {
          setCounterGoal(counterId, goal);
          setGoalModalVisible(false);
        }}
      />

      <DailyChallengeModal
        visible={dailyChallengeModalVisible}
        current={counter.dailyChallenge}
        onCancel={() => setDailyChallengeModalVisible(false)}
        onSubmit={(patch) => {
          updateDailyChallenge(counterId, patch);
          setDailyChallengeModalVisible(false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toggleWrap: { marginTop: 20, alignItems: 'center' },
  valueBlock: { alignItems: 'center', marginTop: 20, paddingHorizontal: 24 },
  value: { fontSize: 72, fontWeight: '700' },
  viewModeLabel: { fontSize: 12, marginTop: -4 },
  stepChip: { marginTop: 8, paddingVertical: 4, paddingHorizontal: 10 },
  hint: { marginTop: 16, textAlign: 'center', fontSize: 12, lineHeight: 17 },
  goalBlock: { alignItems: 'center', marginTop: 24 },
  goalRing: { alignItems: 'center' },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
    marginTop: 48,
  },
  roundButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButtonPrimary: { width: 108, height: 108, borderRadius: 54 },
  roundButtonText: { fontSize: 40, fontWeight: '400' },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 56,
  },
});
