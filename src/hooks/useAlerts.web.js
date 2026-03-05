import { useCallback, useRef, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

const TTS_WORKER_URL = 'https://takt-tts.teanocrata.workers.dev';
const TTS_VOICE = 'es-ES-ElviraNeural';

// Module-level TTS cache and audio element (shared across hook instances)
const ttsCache = {};
let ttsAudio = null;

function getTtsAudio() {
  if (!ttsAudio) {
    ttsAudio = new Audio();
    ttsAudio.volume = 1.0;
  }
  return ttsAudio;
}

async function fetchTts(text, signal) {
  if (ttsCache[text]) return;
  try {
    const res = await fetch(TTS_WORKER_URL + '/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: TTS_VOICE }),
      signal,
    });
    if (res.ok) {
      ttsCache[text] = await res.blob();
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.warn('TTS fetch failed for:', text, e);
    }
  }
}

function speak(text) {
  const blob = ttsCache[text];
  if (blob) {
    const audio = getTtsAudio();
    const url = URL.createObjectURL(blob);
    const prevUrl = audio.dataset?.objectUrl;
    if (prevUrl) URL.revokeObjectURL(prevUrl);
    audio.src = url;
    audio.dataset.objectUrl = url;
    audio.play().catch(() => {});
    return;
  }
  // Fallback: speechSynthesis (foreground only)
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    utter.rate = 0.9;
    utter.volume = 1;
    synth.speak(utter);
  } catch (e) {}
}

function vibrate(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch (e) {}
}

export function useAlerts() {
  const { settings } = useSettings();
  const abortRef = useRef(null);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const preGenerateTTS = useCallback(async (session) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    const texts = new Set();
    for (const interval of session.intervals) {
      texts.add(interval.name);
    }
    texts.add('Diez segundos');
    texts.add('Sesión completada. Buen trabajo.');

    await Promise.all([...texts].map((t) => fetchTts(t, signal)));
  }, []);

  const announceInterval = useCallback(
    (interval) => {
      if (settings.voice) speak(interval.name);
      if (settings.vibrate) vibrate([0, 250, 250, 250]);
    },
    [settings.voice, settings.vibrate]
  );

  const warn10Seconds = useCallback(() => {
    if (settings.warning && settings.voice) speak('Diez segundos');
    if (settings.warning && settings.vibrate) vibrate([0, 150]);
  }, [settings.warning, settings.voice, settings.vibrate]);

  const warn3Seconds = useCallback(() => {
    if (settings.warning && settings.vibrate) vibrate([0, 100]);
  }, [settings.warning, settings.vibrate]);

  const announceComplete = useCallback(() => {
    if (settings.voice) speak('Sesión completada. Buen trabajo.');
    if (settings.vibrate) vibrate([0, 250, 250, 250]);
  }, [settings.voice, settings.vibrate]);

  return { announceInterval, warn10Seconds, warn3Seconds, announceComplete, preGenerateTTS };
}
