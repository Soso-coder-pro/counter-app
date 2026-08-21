import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import type { Counter, CounterList } from '../src/store/types';
import { useCounterStore } from '../src/store/useCounterStore';
import { useTheme } from '../src/theme/colors';
import { formatDateTime } from '../src/utils/date';

export default function ArchiveScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const archivedLists = useCounterStore(useShallow((s) => s.getArchivedLists()));
  const archivedCounters = useCounterStore(useShallow((s) => s.getArchivedCounters()));
  const restoreList = useCounterStore((s) => s.restoreList);
  const removeList = useCounterStore((s) => s.removeList);
  const restoreCounter = useCounterStore((s) => s.restoreCounter);
  const removeCounter = useCounterStore((s) => s.removeCounter);

  function confirmDeleteList(list: CounterList) {
    Alert.alert(
      'Supprimer définitivement',
      `Supprimer "${list.name}" et tous ses compteurs pour toujours ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => removeList(list.id) },
      ]
    );
  }

  function confirmDeleteCounter(counter: Counter) {
    Alert.alert(
      'Supprimer définitivement',
      `Supprimer "${counter.name}" et son historique pour toujours ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => removeCounter(counter.id) },
      ]
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Défis archivés</Text>
      <View style={styles.list}>
        {archivedLists.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.subtext }]}>Aucun défi archivé.</Text>
        ) : (
          archivedLists.map((list) => (
            <View key={list.id} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{list.name}</Text>
                <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
                  Archivé le {formatDateTime(list.archivedAt ?? 0)}
                </Text>
              </View>
              <Pressable onPress={() => restoreList(list.id)} style={styles.action}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Restaurer</Text>
              </Pressable>
              <Pressable onPress={() => confirmDeleteList(list)} style={styles.action}>
                <Text style={{ color: colors.danger, fontWeight: '600' }}>Supprimer</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Compteurs archivés</Text>
      <View style={styles.list}>
        {archivedCounters.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.subtext }]}>Aucun compteur archivé.</Text>
        ) : (
          archivedCounters.map((counter) => (
            <View
              key={counter.id}
              style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{counter.name}</Text>
                <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
                  Valeur : {counter.value} · Archivé le {formatDateTime(counter.archivedAt ?? 0)}
                </Text>
              </View>
              <Pressable onPress={() => restoreCounter(counter.id)} style={styles.action}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Restaurer</Text>
              </Pressable>
              <Pressable onPress={() => confirmDeleteCounter(counter)} style={styles.action}>
                <Text style={{ color: colors.danger, fontWeight: '600' }}>Supprimer</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 16, marginTop: 20 },
  list: { paddingHorizontal: 16, marginTop: 10, gap: 10 },
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSubtitle: { fontSize: 12, marginTop: 2 },
  action: { paddingVertical: 4, paddingHorizontal: 2 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 12 },
});
