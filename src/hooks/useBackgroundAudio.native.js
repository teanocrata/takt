import { useRef, useCallback } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

const silenceSource = require('../../assets/silence.wav');

export function useBackgroundAudio() {
  const player = useAudioPlayer(silenceSource);
  const isActive = useRef(false);

  const start = useCallback(async () => {
    if (isActive.current) return;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
      });
      player.loop = true;
      player.volume = 0.01;
      player.play();
      player.setActiveForLockScreen(true, { title: 'Takt' });
      isActive.current = true;
    } catch (e) {
      console.warn('Background audio start failed:', e);
    }
  }, [player]);

  const updateMetadata = useCallback((title) => {
    if (!isActive.current) return;
    try {
      player.updateLockScreenMetadata({ title });
    } catch (e) {}
  }, [player]);

  const stop = useCallback(() => {
    try {
      player.clearLockScreenControls();
      player.pause();
      isActive.current = false;
    } catch (e) {
      console.warn('Background audio stop failed:', e);
    }
  }, [player]);

  return { start, stop, updateMetadata };
}
