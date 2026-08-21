import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { BarProgress } from '../src/components/BarProgress';
import type { Counter } from '../src/store/types';
import { useCounterStore } from '../src/store/useCounterStore';
import { useTheme } from '../src/theme/colors';
import { formatGoalFraction, formatGoalPercent } from '../src/utils/goal';

export default function ChallengeScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const counters = useCounterStore(useShallow((s) => s.getCountersWithGoals()));
  const lists = useCounterStore(useShallow((s) => s.lists));

  function listNameFor(listId: string): string {
    return lists.find((l) => l.id === listId)?.name ?? '';
  }

  function renderItem({ item }: { item: Counter }) {
    if (item.goal === null) return null;
    return (
      <Link href={`/counter/${item.id}`} asChild>
        <Pressable
          style={StyleSheet.flatten([styles.card, { backgroundColor: colors.card, borderColor: colors.border }])}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>{listNameFor(item.listId)}</Text>
            </View>
            <Text style={[styles.cardPercent, { color: colors.primary }]}>
              {formatGoalPercent(item.value, item.goal)}
            </Text>
          </View>
          <BarProgress value={item.value} goal={item.goal} />
          <Text style={[styles.cardFraction, { color: colors.subtext }]}>
            {formatGoalFraction(item.value, item.goal)}
          </Text>
        </Pressable>
      </Link>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={counters}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: 16 + insets.bottom }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              Aucun compteur n'a d'objectif pour l'instant.{'\n'}Ouvre un compteur et touche "Définir un objectif"
              pour le voir apparaître ici.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, gap: 12, flexGrow: 1 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { fontSize: 12, marginTop: 2 },
  cardPercent: { fontSize: 18, fontWeight: '700' },
  cardFraction: { fontSize: 12, textAlign: 'right' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyText: { textAlign: 'center', fontSize: 15, lineHeight: 22 },
});
