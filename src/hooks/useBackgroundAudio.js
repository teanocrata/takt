import { useRef, useCallback } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

// DEBUG: audible beep every 3s to test background audio
const silenceSource = require('../../assets/beep-debug.wav');

export function useBackgroundAudio() {
  const player = useAudioPlayer(silenceSource);
  const isActive = useRef(false);

  const start = useCallback(async () => {
    if (isActive.current) return;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
      });
      player.loop = true;
      // Low but not near-zero — Android may kill audio services with very low volume
      player.volume = 0.5; // DEBUG: audible volume
      player.play();
      isActive.current = true;
    } catch (e) {
      console.warn('Background audio start failed:', e);
    }
  }, [player]);

  const stop = useCallback(() => {
    try {
      player.pause();
      isActive.current = false;
    } catch (e) {
      console.warn('Background audio stop failed:', e);
    }
  }, [player]);

  return { start, stop };
}
