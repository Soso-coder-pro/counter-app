import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { PromptModal } from '../src/components/PromptModal';
import { useCounterStore } from '../src/store/useCounterStore';
import type { CounterList } from '../src/store/types';
import { useTheme } from '../src/theme/colors';

export default function ListsScreen() {
  const colors = useTheme();
  const router = useRouter();
  const lists = useCounterStore((s) => s.getListsSorted());
  const getCountersForList = useCounterStore((s) => s.getCountersForList);
  const getListTotals = useCounterStore((s) => s.getListTotals);
  const addList = useCounterStore((s) => s.addList);
  const [modalVisible, setModalVisible] = useState(false);

  function handleCreate(name: string) {
    const id = addList(name);
    setModalVisible(false);
    router.push(`/list/${id}`);
  }

  function renderItem({ item }: { item: CounterList }) {
    const counters = getCountersForList(item.id);
    const { sum, average } = getListTotals(item.id);
    return (
      <Link href={`/list/${item.id}`} asChild>
        <Pressable style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>
            {counters.length} compteur{counters.length > 1 ? 's' : ''}
            {!item.hideSumAndAverage && counters.length > 0
              ? ` · total ${sum} · moyenne ${average.toFixed(1)}`
              : ''}
          </Text>
        </Pressable>
      </Link>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              Aucune liste pour l'instant.{'\n'}Crée ta première liste de compteurs avec le bouton +.
            </Text>
          </View>
        }
      />

      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Ajouter une liste"
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      <PromptModal
        visible={modalVisible}
        title="Nouvelle liste"
        placeholder="Ex : Défi 30 jours"
        confirmLabel="Créer"
        onCancel={() => setModalVisible(false)}
        onSubmit={handleCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, gap: 12, flexGrow: 1 },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  cardSubtitle: { fontSize: 13, marginTop: 4 },
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
