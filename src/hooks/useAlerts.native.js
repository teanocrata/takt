import { useCallback, useRef, useEffect } from 'react';
import { preload, createAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../context/SettingsContext';

const TTS_WORKER_URL = 'https://takt-tts.teanocrata.workers.dev';
const TTS_VOICE = 'es-ES-ElviraNeural';

// Module-level TTS player and cache (shared across hook instances)
let ttsPlayer = null;
const preloadedTexts = new Set();

function getTtsPlayer() {
  if (!ttsPlayer) {
    ttsPlayer = createAudioPlayer(null);
    ttsPlayer.volume = 1.0;
  }
  return ttsPlayer;
}

function ttsUrl(text) {
  return `${TTS_WORKER_URL}/tts?text=${encodeURIComponent(text)}&voice=${TTS_VOICE}`;
}

async function preloadTts(text) {
  if (preloadedTexts.has(text)) return;
  try {
    await preload(ttsUrl(text));
    preloadedTexts.add(text);
  } catch (e) {
    console.warn('TTS preload failed for:', text, e);
  }
}

function speak(text) {
  if (preloadedTexts.has(text)) {
    try {
      const player = getTtsPlayer();
      player.replace(ttsUrl(text));
      player.play();
      return;
    } catch (e) {
      console.warn('TTS audio play failed, falling back to Speech:', e);
    }
  }
  // Fallback: expo-speech (foreground only)
  try {
    Speech.stop();
    Speech.speak(text, { language: 'es-ES', rate: 0.9 });
  } catch (e) {}
}

export function useAlerts() {
  const { settings } = useSettings();

  const preGenerateTTS = useCallback(async (session) => {
    const texts = new Set();
    for (const interval of session.intervals) {
      texts.add(interval.name);
    }
    texts.add('Diez segundos');
    texts.add('Sesión completada. Buen trabajo.');

    await Promise.all([...texts].map((t) => preloadTts(t)));
  }, []);

  const announceInterval = useCallback(
    (interval) => {
      if (settings.voice) speak(interval.name);
      if (settings.vibrate) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    [settings.voice, settings.vibrate]
  );

  const warn10Seconds = useCallback(() => {
    if (settings.warning && settings.voice) speak('Diez segundos');
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
    if (settings.voice) speak('Sesión completada. Buen trabajo.');
    if (settings.vibrate) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [settings.voice, settings.vibrate]);

  return { announceInterval, warn10Seconds, warn3Seconds, announceComplete, preGenerateTTS };
}
