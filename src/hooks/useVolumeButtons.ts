import { useEffect, useRef } from 'react';
import { VolumeManager } from 'react-native-volume-manager';

const NEUTRAL_VOLUME = 0.5;

/**
 * Capture les boutons de volume physiques comme "+" / "-" tant que le hook est
 * monté et `enabled` est vrai. Fonctionne en recentrant le volume système à
 * 50% et en observant si l'appui suivant le fait monter ou descendre.
 *
 * ⚠️ Nécessite un Development Build (EAS, profil "development") : le module
 * natif react-native-volume-manager n'est pas embarqué dans Expo Go. Dans
 * Expo Go, les appels natifs ci-dessous échouent silencieusement (catch) et
 * le hook ne fait simplement rien — l'app reste utilisable avec les boutons
 * à l'écran.
 */
export function useVolumeButtons(onVolumeUp: () => void, onVolumeDown: () => void, enabled: boolean) {
  const lastVolume = useRef<number>(NEUTRAL_VOLUME);
  const isRecentering = useRef(false);
  const onUpRef = useRef(onVolumeUp);
  const onDownRef = useRef(onVolumeDown);
  onUpRef.current = onVolumeUp;
  onDownRef.current = onVolumeDown;

  useEffect(() => {
    if (!enabled) return;
    let subscription: { remove: () => void } | undefined;
    let cancelled = false;

    (async () => {
      try {
        await VolumeManager.showNativeVolumeUI({ enabled: false });
        await VolumeManager.setVolume(NEUTRAL_VOLUME, { showUI: false });
        if (cancelled) return;
        lastVolume.current = NEUTRAL_VOLUME;

        subscription = VolumeManager.addVolumeListener((result) => {
          if (isRecentering.current) return;
          const previous = lastVolume.current;
          const next = result.volume;
          lastVolume.current = next;

          if (next > previous) onUpRef.current();
          else if (next < previous) onDownRef.current();

          // Recentre pour ne jamais atteindre 0% ou 100% (ce qui empêcherait
          // de détecter un nouvel appui dans le même sens).
          if (next <= 0.1 || next >= 0.9) {
            isRecentering.current = true;
            VolumeManager.setVolume(NEUTRAL_VOLUME, { showUI: false })
              .then(() => {
                lastVolume.current = NEUTRAL_VOLUME;
              })
              .finally(() => {
                isRecentering.current = false;
              });
          }
        });
      } catch {
        // Module natif indisponible (Expo Go, web...) : capture désactivée silencieusement.
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
      VolumeManager.showNativeVolumeUI({ enabled: true }).catch(() => {});
    };
  }, [enabled]);
}
