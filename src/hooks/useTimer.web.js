import { useRef, useCallback, useEffect } from 'react';

// Web Worker keeps setInterval running at full speed even when
// the tab is backgrounded or the screen is off.
function createTimerWorker() {
  const code = `
    let timer = null;
    self.onmessage = function(e) {
      if (e.data === 'start') {
        if (timer) clearInterval(timer);
        timer = setInterval(() => self.postMessage('tick'), 250);
      } else if (e.data === 'stop') {
        if (timer) clearInterval(timer);
        timer = null;
      }
    };
  `;
  const blob = new Blob([code], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}

export function useTimer({ onTick, onIntervalComplete, onWarning10, onWarning3 }) {
  const workerRef = useRef(null);
  const stateRef = useRef({
    intervalStartTime: 0,
    intervalDuration: 0,
    pauseRemaining: 0,
    isPlaying: false,
    warned10: false,
    warned3: false,
  });
  // Keep callbacks in refs so the worker handler always sees the latest
  const cbRef = useRef({ onTick, onIntervalComplete, onWarning10, onWarning3 });
  cbRef.current = { onTick, onIntervalComplete, onWarning10, onWarning3 };

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.isPlaying) return;

    const elapsed = Date.now() - s.intervalStartTime;
    const remaining = Math.max(0, s.intervalDuration - elapsed);
    const remainingSeconds = remaining / 1000;

    if (!s.warned10 && remainingSeconds <= 10 && remainingSeconds > 0) {
      s.warned10 = true;
      cbRef.current.onWarning10?.();
    }

    if (!s.warned3 && remainingSeconds <= 3 && remainingSeconds > 0) {
      s.warned3 = true;
      cbRef.current.onWarning3?.();
    }

    if (remaining <= 0) {
      workerRef.current?.postMessage('stop');
      s.isPlaying = false;
      cbRef.current.onIntervalComplete?.();
      return;
    }

    cbRef.current.onTick?.(remainingSeconds);
  }, []);

  // Create worker once and wire up tick handler
  useEffect(() => {
    const worker = createTimerWorker();
    worker.onmessage = () => tick();
    workerRef.current = worker;
    return () => worker.terminate();
  }, [tick]);

  const start = useCallback((durationMs) => {
    const s = stateRef.current;
    s.intervalStartTime = Date.now();
    s.intervalDuration = durationMs;
    s.pauseRemaining = 0;
    s.isPlaying = true;
    s.warned10 = durationMs / 1000 <= 10;
    s.warned3 = durationMs / 1000 <= 3;
    workerRef.current?.postMessage('stop');
    workerRef.current?.postMessage('start');
  }, []);

  const pause = useCallback(() => {
    const s = stateRef.current;
    if (!s.isPlaying) return;
    s.isPlaying = false;
    s.pauseRemaining = Math.max(0, s.intervalDuration - (Date.now() - s.intervalStartTime));
    workerRef.current?.postMessage('stop');
  }, []);

  const resume = useCallback(() => {
    const s = stateRef.current;
    if (s.isPlaying) return;
    s.intervalStartTime = Date.now();
    s.intervalDuration = s.pauseRemaining;
    s.isPlaying = true;
    workerRef.current?.postMessage('stop');
    workerRef.current?.postMessage('start');
  }, []);

  const stop = useCallback(() => {
    stateRef.current.isPlaying = false;
    workerRef.current?.postMessage('stop');
  }, []);

  const getRemainingMs = useCallback(() => {
    const s = stateRef.current;
    if (!s.isPlaying) return s.pauseRemaining;
    return Math.max(0, s.intervalDuration - (Date.now() - s.intervalStartTime));
  }, []);

  return { start, pause, resume, stop, getRemainingMs };
}
