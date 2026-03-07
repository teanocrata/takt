import { useRef, useCallback } from 'react';

// Generate a 2s looped WAV in-memory with near-inaudible content.
// Chrome Android uses AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK for audio < 5s,
// which only ducks other apps briefly instead of pausing them (e.g. Spotify keeps playing).
// A looped <audio> element keeps Chrome alive even with screen off.
function createKeepaliveWav() {
  const sampleRate = 8000;
  const duration = 2;
  const numSamples = sampleRate * duration;
  const bytesPerSample = 2;
  const headerSize = 44;
  const dataSize = numSamples * bytesPerSample;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    view.setInt16(headerSize + i * bytesPerSample, i % 2 === 0 ? 1 : -1, true);
  }

  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}

export function useBackgroundAudio() {
  const audioRef = useRef(null);
  const isActive = useRef(false);

  const start = useCallback(async () => {
    if (isActive.current) return;
    try {
      if (!audioRef.current) {
        const audio = document.createElement('audio');
        audio.loop = true;
        audio.volume = 0.01;
        audio.src = createKeepaliveWav();
        audioRef.current = audio;
      }
      await audioRef.current.play();
      isActive.current = true;
    } catch (e) {
      console.warn('Background audio start failed:', e);
    }
  }, []);

  const stop = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      isActive.current = false;
    } catch (e) {
      console.warn('Background audio stop failed:', e);
    }
  }, []);

  const updateMetadata = useCallback(() => {}, []);

  return { start, stop, updateMetadata };
}
