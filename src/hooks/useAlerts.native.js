import { useCallback } from 'react';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../context/SettingsContext';

export function useAlerts() {
  const { settings } = useSettings();

  const announceInterval = useCallback(
    (interval) => {
      if (settings.voice) {
        Speech.stop();
        Speech.speak(interval.name, { language: 'es-ES', rate: 0.9 });
      }
      if (settings.vibrate) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    [settings.voice, settings.vibrate]
  );

  const warn10Seconds = useCallback(() => {
    if (settings.warning && settings.voice) {
      Speech.speak('Diez segundos', { language: 'es-ES', rate: 1.0 });
    }
    if (settings.warning && settings.vibrate) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [settings.warning, settings.voice, settings.vibrate]);

  const warn3Seconds = useCallback(() => {
    if (settings.warning && settings.vibrate) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [settings.warning, settings.vibrate]);

  const announceComplete = useCallback(() => {
    if (settings.voice) {
      Speech.stop();
      Speech.speak('Sesion completada. Buen trabajo.', {
        language: 'es-ES',
        rate: 0.9,
      });
    }
    if (settings.vibrate) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [settings.voice, settings.vibrate]);

  const preGenerateTTS = useCallback(async () => {}, []);

  return { announceInterval, warn10Seconds, warn3Seconds, announceComplete, preGenerateTTS };
}
