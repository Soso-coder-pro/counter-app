import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { HistoryRow } from '../../../src/components/HistoryRow';
import { useCounterStore } from '../../../src/store/useCounterStore';
import { useTheme } from '../../../src/theme/colors';
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  daysInMonth,
  firstWeekdayOfMonth,
  groupHistoryByDay,
  groupHistoryEntriesByDay,
} from '../../../src/utils/calendar';
import { dayKey } from '../../../src/utils/date';

function keyFor(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarScreen() {
  const { counterId } = useLocalSearchParams<{ counterId: string }>();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const counter = useCounterStore((s) => s.counters.find((c) => c.id === counterId));
  const history = useCounterStore(useShallow((s) => (counterId ? s.getHistoryForCounter(counterId) : [])));

  const today = new Date();
  const [viewedYear, setViewedYear] = useState(today.getFullYear());
  const [viewedMonth, setViewedMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const dayTotals = useMemo(() => groupHistoryByDay(history), [history]);
  const dayEntries = useMemo(() => groupHistoryEntriesByDay(history), [history]);

  const totalDays = daysInMonth(viewedYear, viewedMonth);
  const offset = firstWeekdayOfMonth(viewedYear, viewedMonth);
  const todayKey = dayKey(today.getTime());

  function changeMonth(delta: number) {
    let month = viewedMonth + delta;
    let year = viewedYear;
    if (month < 0) {
      month = 11;
      year -= 1;
    } else if (month > 11) {
      month = 0;
      year += 1;
    }
    setViewedMonth(month);
    setViewedYear(year);
    setSelectedDay(null);
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const selectedEntries = selectedDay ? (dayEntries.get(selectedDay) ?? []) : [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
    >
      <Stack.Screen options={{ title: counter ? `Calendrier · ${counter.name}` : 'Calendrier' }} />

      <View style={styles.monthNav}>
        <Pressable onPress={() => changeMonth(-1)} style={styles.navButton}>
          <Text style={{ color: colors.primary, fontSize: 20 }}>‹</Text>
        </Pressable>
        <Text style={[styles.monthLabel, { color: colors.text }]}>
          {MONTH_LABELS[viewedMonth]} {viewedYear}
        </Text>
        <Pressable onPress={() => changeMonth(1)} style={styles.navButton}>
          <Text style={{ color: colors.primary, fontSize: 20 }}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, i) => (
          <Text key={`${label}-${i}`} style={[styles.weekdayLabel, { color: colors.subtext }]}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, index) => {
          if (day === null) return <View key={`empty-${index}`} style={styles.cell} />;
          const key = keyFor(viewedYear, viewedMonth, day);
          const total = dayTotals.get(key) ?? 0;
          const isToday = key === todayKey;
          const isSelected = key === selectedDay;
          return (
            <Pressable
              key={key}
              style={[
                styles.cell,
                styles.dayCell,
                { borderColor: isToday ? colors.primary : 'transparent' },
                isSelected && { backgroundColor: colors.primary },
              ]}
              onPress={() => setSelectedDay(isSelected ? null : key)}
            >
              <Text style={[styles.dayNumber, { color: isSelected ? '#FFFFFF' : colors.text }]}>{day}</Text>
              {total !== 0 && (
                <Text
                  style={[
                    styles.dayTotal,
                    { color: isSelected ? '#FFFFFF' : total > 0 ? colors.primary : colors.danger },
                  ]}
                >
                  {total > 0 ? '+' : ''}
                  {total}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.detailSection}>
        {selectedDay ? (
          selectedEntries.length > 0 ? (
            <>
              <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedDay}</Text>
              {selectedEntries.map((entry) => (
                <HistoryRow key={entry.id} entry={entry} />
              ))}
            </>
          ) : (
            <Text style={[styles.hint, { color: colors.subtext }]}>Aucun décompte ce jour-là.</Text>
          )
        ) : (
          <Text style={[styles.hint, { color: colors.subtext }]}>Touche un jour pour voir le détail.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  navButton: { padding: 8 },
  monthLabel: { fontSize: 17, fontWeight: '600', minWidth: 160, textAlign: 'center' },
  weekdayRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 8 },
  weekdayLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 4 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  dayCell: {
    borderWidth: 1.5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: { fontSize: 14, fontWeight: '600' },
  dayTotal: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  detailSection: { paddingHorizontal: 16, marginTop: 16 },
  detailTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  hint: { textAlign: 'center', fontSize: 13, marginTop: 24 },
});
