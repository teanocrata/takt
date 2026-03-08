import { useRef, useCallback, useEffect } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

const silenceSource = require('../../assets/silence.wav');

export function useBackgroundAudio(onHeartbeat) {
  const player = useAudioPlayer(silenceSource, { updateInterval: 250 });
  const isActive = useRef(false);

  // Native playback status updates fire even with screen off,
  // unlike JS setInterval which gets suspended by Android.
  // Use them as a heartbeat to drive the timer.
  useEffect(() => {
    if (!onHeartbeat) return;
    const sub = player.addListener('playbackStatusUpdate', () => {
      if (isActive.current) onHeartbeat();
    });
    return () => sub.remove();
  }, [player, onHeartbeat]);

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
