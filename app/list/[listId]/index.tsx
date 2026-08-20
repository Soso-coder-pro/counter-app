import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { PromptModal } from '../../../src/components/PromptModal';
import type { Counter } from '../../../src/store/types';
import { useCounterStore } from '../../../src/store/useCounterStore';
import { useTheme } from '../../../src/theme/colors';

export default function ListScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const colors = useTheme();
  const router = useRouter();

  const list = useCounterStore((s) => s.lists.find((l) => l.id === listId));
  // useShallow : ces deux sélecteurs recréent un tableau/objet à chaque appel
  // (via getCountersForList/getListTotals), ce qui casse la comparaison par
  // référence de useSyncExternalStore et boucle sans lui.
  const counters = useCounterStore(useShallow((s) => (listId ? s.getCountersForList(listId) : [])));
  const { sum, average } = useCounterStore(
    useShallow((s) => (listId ? s.getListTotals(listId) : { sum: 0, average: 0, count: 0 }))
  );
  const addCounter = useCounterStore((s) => s.addCounter);
  const toggleNewCounterAtTop = useCounterStore((s) => s.toggleNewCounterAtTop);
  const [modalVisible, setModalVisible] = useState(false);

  if (!list || !listId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.subtext }}>Liste introuvable.</Text>
      </View>
    );
  }

  function handleCreate(name: string) {
    const id = addCounter(listId, name);
    setModalVisible(false);
    router.push(`/counter/${id}`);
  }

  function renderItem({ item }: { item: Counter }) {
    return (
      <Link href={`/counter/${item.id}`} asChild>
        <Pressable
          style={StyleSheet.flatten([styles.card, { backgroundColor: colors.card, borderColor: colors.border }])}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>pas actuel : +{item.step}</Text>
          </View>
          <Text style={[styles.cardValue, { color: colors.primary }]}>{item.value}</Text>
        </Pressable>
      </Link>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: list.name }} />

      {!list.hideSumAndAverage && counters.length > 0 && (
        <View style={[styles.summary, { borderColor: colors.border }]}>
          <Text style={{ color: colors.subtext }}>
            Total <Text style={{ color: colors.text, fontWeight: '700' }}>{sum}</Text> · Moyenne{' '}
            <Text style={{ color: colors.text, fontWeight: '700' }}>{average.toFixed(1)}</Text>
          </Text>
        </View>
      )}

      <Pressable onPress={() => toggleNewCounterAtTop(listId)} style={styles.toggleRow}>
        <Text style={{ color: colors.subtext, fontSize: 13 }}>
          Nouveau compteur en haut : {list.newCounterAtTop ? 'activé ✓' : 'désactivé'}
        </Text>
      </Pressable>

      <FlatList
        data={counters}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              Aucun compteur dans cette liste.{'\n'}Ajoute-en un avec le bouton +.
            </Text>
          </View>
        }
      />

      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Ajouter un compteur"
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      <PromptModal
        visible={modalVisible}
        title="Nouveau compteur"
        placeholder="Ex : Pompes"
        confirmLabel="Créer"
        onCancel={() => setModalVisible(false)}
        onSubmit={handleCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  summary: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  toggleRow: { paddingHorizontal: 16, paddingTop: 10 },
  listContent: { padding: 16, gap: 12, flexGrow: 1 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  cardSubtitle: { fontSize: 13, marginTop: 4 },
  cardValue: { fontSize: 24, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyText: { textAlign: 'center', fontSize: 15, lineHeight: 22 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabIcon: { color: '#FFFFFF', fontSize: 30, fontWeight: '400', marginTop: -2 },
});
