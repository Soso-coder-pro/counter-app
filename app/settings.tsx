import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReminderTimeModal } from '../src/components/ReminderTimeModal';
import { SettingsRow } from '../src/components/SettingsRow';
import { useCounterStore } from '../src/store/useCounterStore';
import { useTheme } from '../src/theme/colors';
import { requestNotificationPermission } from '../src/utils/notifications';

export default function SettingsScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useCounterStore((s) => s.settings);
  const updateSettings = useCounterStore((s) => s.updateSettings);
  const [timeModalVisible, setTimeModalVisible] = useState(false);

  async function handleToggleNotifications(value: boolean) {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Permission refusée',
          "Active les notifications pour cette app dans les réglages de ton téléphone pour recevoir des rappels."
        );
        return;
      }
    }
    updateSettings({ notifications: { ...settings.notifications, enabled: value } });
  }

  function addTime(time: string) {
    if (settings.notifications.times.includes(time)) {
      setTimeModalVisible(false);
      return;
    }
    const times = [...settings.notifications.times, time].sort();
    updateSettings({ notifications: { ...settings.notifications, times } });
    setTimeModalVisible(false);
  }

  function removeTime(time: string) {
    const times = settings.notifications.times.filter((t) => t !== time);
    updateSettings({ notifications: { ...settings.notifications, times } });
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Compteurs</Text>
      <View style={styles.section}>
        <SettingsRow
          label="Vibration au clic"
          description="Retour haptique sur les boutons +/- des compteurs."
          value={settings.hapticsOnTap}
          onValueChange={(v) => updateSettings({ hapticsOnTap: v })}
        />
        <SettingsRow
          label="Clic via bouton volume"
          description="Incrémenter/décrémenter avec les boutons de volume physiques (nécessite un Development Build)."
          value={settings.volumeButtonsEnabled}
          onValueChange={(v) => updateSettings({ volumeButtonsEnabled: v })}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Écran</Text>
      <View style={styles.section}>
        <SettingsRow
          label="Garder l'écran allumé"
          description="Empêche la mise en veille tant que l'app est ouverte au premier plan."
          value={settings.keepScreenAwake}
          onValueChange={(v) => updateSettings({ keepScreenAwake: v })}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
      <View style={styles.section}>
        <SettingsRow
          label="Notifications de rappel"
          description="Rappel pour les compteurs en défi quotidien non encore atteint."
          value={settings.notifications.enabled}
          onValueChange={handleToggleNotifications}
        />

        {settings.notifications.enabled && (
          <View style={styles.timesBlock}>
            {settings.notifications.times.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.subtext }]}>Aucune heure configurée.</Text>
            ) : (
              <View style={styles.chipsRow}>
                {settings.notifications.times.map((time) => (
                  <Pressable
                    key={time}
                    onPress={() => removeTime(time)}
                    style={[styles.chip, { borderColor: colors.border }]}
                  >
                    <Text style={{ color: colors.text, fontWeight: '600' }}>{time}</Text>
                    <Text style={{ color: colors.danger, marginLeft: 6 }}>✕</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <Pressable onPress={() => setTimeModalVisible(true)} style={styles.addTimeButton}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>+ Ajouter une heure</Text>
            </Pressable>
          </View>
        )}
      </View>

      <ReminderTimeModal visible={timeModalVisible} onCancel={() => setTimeModalVisible(false)} onSubmit={addTime} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', paddingHorizontal: 16, marginTop: 24 },
  section: { paddingHorizontal: 16, marginTop: 8 },
  timesBlock: { paddingTop: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addTimeButton: { marginTop: 12 },
  emptyText: { fontSize: 13 },
});
