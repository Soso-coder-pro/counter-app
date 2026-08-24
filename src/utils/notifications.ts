import { Platform } from 'react-native';

/**
 * Rappels locaux (pas de push/serveur) pour les défis quotidiens.
 *
 * Limite assumée : une notification programmée à l'avance ne peut pas
 * exécuter de code au moment où elle se déclenche, donc son contenu ne peut
 * pas refléter la progression réelle au moment précis de la notification
 * (elle serait exacte au moment de la programmation, mais possiblement
 * fausse plus tard dans la journée). Le texte reste donc un rappel
 * générique plutôt qu'un décompte dynamique.
 *
 * Import dynamique (comme useVolumeButtons) : si un futur module natif
 * manquant levait une erreur à l'évaluation, un import statique planterait
 * tout ce fichier avant même d'atteindre un try/catch.
 */

const CHANNEL_ID = 'daily-challenge-reminders';
const REMINDER_TITLE = 'Défi quotidien';
const REMINDER_BODY = "Pense à vérifier tes défis du jour avant qu'il ne soit trop tard !";

function parseTime(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export function isValidTime(time: string): boolean {
  return parseTime(time) !== null;
}

/** Demande la permission d'envoyer des notifications. Renvoie false si refusée. */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const Notifications = await import('expo-notifications');
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

/**
 * Annule tous les rappels programmés puis reprogramme un rappel quotidien
 * répété par heure configurée. Ne fait rien si `enabled` est faux ou si la
 * liste d'heures est vide.
 */
export async function rescheduleReminders(enabled: boolean, times: string[]): Promise<void> {
  try {
    const Notifications = await import('expo-notifications');

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Rappels de défi quotidien',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // Cette app n'utilise les notifications programmées que pour ces
    // rappels : tout annuler avant de reprogrammer est sûr et simple (pas
    // besoin de suivre des identifiants individuels).
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!enabled) return;

    for (const time of times) {
      const parsed = parseTime(time);
      if (!parsed) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: REMINDER_TITLE, body: REMINDER_BODY },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: parsed.hour,
          minute: parsed.minute,
          channelId: CHANNEL_ID,
        },
      });
    }
  } catch {
    // Module natif indisponible ou permission refusée : on ignore
    // silencieusement, l'app reste utilisable sans rappels.
  }
}

/** Configure comment les notifications s'affichent quand l'app est au premier plan. */
export async function configureNotificationHandler(): Promise<void> {
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // Module natif indisponible : pas de notifications, l'app reste utilisable.
  }
}
