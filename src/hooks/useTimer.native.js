import { useRef, useCallback, useEffect } from 'react';

export function useTimer({ onTick, onIntervalComplete, onWarning10, onWarning3 }) {
  const timerRef = useRef(null);
  const stateRef = useRef({
    intervalStartTime: 0,
    intervalDuration: 0,
    pauseRemaining: 0,
    isPlaying: false,
    warned10: false,
    warned3: false,
  });

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.isPlaying) return;

    const elapsed = Date.now() - s.intervalStartTime;
    const remaining = Math.max(0, s.intervalDuration - elapsed);
    const remainingSeconds = remaining / 1000;

    // 10-second warning
    if (!s.warned10 && remainingSeconds <= 10 && remainingSeconds > 0) {
      s.warned10 = true;
      onWarning10?.();
    }

    // 3-second warning
    if (!s.warned3 && remainingSeconds <= 3 && remainingSeconds > 0) {
      s.warned3 = true;
      onWarning3?.();
    }

    if (remaining <= 0) {
      clearInterval(timerRef.current);
      stateRef.current.isPlaying = false;
      onIntervalComplete?.();
      return;
    }

    onTick?.(remainingSeconds);
  }, [onTick, onIntervalComplete, onWarning10, onWarning3]);

  const start = useCallback(
    (durationMs) => {
      const s = stateRef.current;
      s.intervalStartTime = Date.now();
      s.intervalDuration = durationMs;
      s.pauseRemaining = 0;
      s.isPlaying = true;
      s.warned10 = durationMs / 1000 <= 10;
      s.warned3 = durationMs / 1000 <= 3;

      clearInterval(timerRef.current);
      timerRef.current = setInterval(tick, 250);
    },
    [tick]
  );

  const pause = useCallback(() => {
    const s = stateRef.current;
    if (!s.isPlaying) return;
    s.isPlaying = false;
    s.pauseRemaining = Math.max(
      0,
      s.intervalDuration - (Date.now() - s.intervalStartTime)
    );
    clearInterval(timerRef.current);
  }, []);

  const resume = useCallback(() => {
    const s = stateRef.current;
    if (s.isPlaying) return;
    s.intervalStartTime = Date.now();
    s.intervalDuration = s.pauseRemaining;
    s.isPlaying = true;

    clearInterval(timerRef.current);
    timerRef.current = setInterval(tick, 250);
  }, [tick]);

  const stop = useCallback(() => {
    stateRef.current.isPlaying = false;
    clearInterval(timerRef.current);
  }, []);

  const getRemainingMs = useCallback(() => {
    const s = stateRef.current;
    if (!s.isPlaying) return s.pauseRemaining;
    return Math.max(0, s.intervalDuration - (Date.now() - s.intervalStartTime));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return { start, pause, resume, stop, getRemainingMs };
}
