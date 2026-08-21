import { useEffect, useRef } from 'react';
import type { VolumeResult } from 'react-native-volume-manager';

const NEUTRAL_VOLUME = 0.5;
// Android peut émettre l'évènement VOLUME_CHANGED_ACTION deux fois pour une
// seule pression physique sur certains appareils/versions (comportement du
// système, pas un abonnement dupliqué côté JS — vérifié : le receiver natif
// a son propre garde-fou, et le projet n'utilise pas React.StrictMode). On
// ignore tout évènement dans la même direction survenant trop vite après le
// précédent pour ne jamais appliquer +2 sur une seule pression.
const DEBOUNCE_MS = 300;

/**
 * Capture les boutons de volume physiques comme "+" / "-" tant que le hook est
 * monté et `enabled` est vrai. Fonctionne en recentrant le volume système à
 * 50% et en observant si l'appui suivant le fait monter ou descendre.
 *
 * ⚠️ Nécessite un Development Build (EAS, profil "development") : le module
 * natif react-native-volume-manager n'est pas embarqué dans Expo Go.
 *
 * Important : quand le module natif n'est pas lié, `react-native-volume-manager`
 * lève une erreur dès son ÉVALUATION (à l'import), pas seulement quand on
 * appelle une de ses fonctions — un `import` statique en haut de fichier ferait
 * donc planter tout ce module (et par ricochet l'écran qui l'importe) avant
 * même d'atteindre un try/catch. On charge donc le module à la demande, à
 * l'intérieur du try, pour que l'échec reste local et silencieux dans Expo Go.
 */
export function useVolumeButtons(onVolumeUp: () => void, onVolumeDown: () => void, enabled: boolean) {
  const lastVolume = useRef<number>(NEUTRAL_VOLUME);
  const isRecentering = useRef(false);
  const lastTriggerAt = useRef(0);
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
        const { VolumeManager } = await import('react-native-volume-manager');
        await VolumeManager.showNativeVolumeUI({ enabled: false });
        await VolumeManager.setVolume(NEUTRAL_VOLUME, { showUI: false });
        if (cancelled) return;
        lastVolume.current = NEUTRAL_VOLUME;

        subscription = VolumeManager.addVolumeListener((result: VolumeResult) => {
          if (isRecentering.current) return;
          const previous = lastVolume.current;
          const next = result.volume;
          lastVolume.current = next;

          const now = Date.now();
          const debounced = now - lastTriggerAt.current < DEBOUNCE_MS;

          if (next > previous) {
            if (!debounced) {
              lastTriggerAt.current = now;
              onUpRef.current();
            }
          } else if (next < previous) {
            if (!debounced) {
              lastTriggerAt.current = now;
              onDownRef.current();
            }
          }

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
      import('react-native-volume-manager')
        .then(({ VolumeManager }) => VolumeManager.showNativeVolumeUI({ enabled: true }))
        .catch(() => {});
    };
  }, [enabled]);
}
