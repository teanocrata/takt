import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import { useAlerts } from '../hooks/useAlerts';
import { useBackgroundAudio } from '../hooks/useBackgroundAudio';
import { useSessions } from './SessionContext';
import {
  scheduleIntervalNotifications,
  cancelAllNotifications,
} from '../utils/notifications';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const { getSession } = useSessions();
  const { announceInterval, warn10Seconds, warn3Seconds, announceComplete, preGenerateTTS } =
    useAlerts();
  const backgroundAudio = useBackgroundAudio();

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const sessionRef = useRef(null);
  const indexRef = useRef(0);
  const totalElapsedRef = useRef(0);
  const completedSecondsRef = useRef(0);

  const startInterval = useCallback(
    (idx) => {
      const s = sessionRef.current;
      if (!s || idx >= s.intervals.length) return;

      const interval = s.intervals[idx];
      const durationMs = interval.minutes * 60 * 1000;

      indexRef.current = idx;
      setCurrentIndex(idx);
      setSecondsLeft(interval.minutes * 60);

      // Calculate completed seconds (sum of all prior intervals)
      let completed = 0;
      for (let i = 0; i < idx; i++) {
        completed += s.intervals[i].minutes * 60;
      }
      completedSecondsRef.current = completed;

      announceInterval(interval);
      timer.start(durationMs);
    },
    [announceInterval]
  );

  const handleIntervalComplete = useCallback(() => {
    const s = sessionRef.current;
    const nextIdx = indexRef.current + 1;

    if (!s || nextIdx >= s.intervals.length) {
      // Session complete
      setIsPlaying(false);
      setIsComplete(true);
      announceComplete();
      backgroundAudio.stop();
      cancelAllNotifications();
      return;
    }

    startInterval(nextIdx);
  }, [startInterval, announceComplete, backgroundAudio]);

  const handleTick = useCallback((remainingSeconds) => {
    setSecondsLeft(remainingSeconds);
    const s = sessionRef.current;
    if (s) {
      const intervalElapsed =
        s.intervals[indexRef.current].minutes * 60 - remainingSeconds;
      setTotalElapsed(completedSecondsRef.current + intervalElapsed);
    }
  }, []);

  const timer = useTimer({
    onTick: handleTick,
    onIntervalComplete: handleIntervalComplete,
    onWarning10: warn10Seconds,
    onWarning3: warn3Seconds,
  });

  const startSession = useCallback(
    async (sessionId) => {
      const s = getSession(sessionId);
      if (!s) return;

      sessionRef.current = s;
      indexRef.current = 0;
      totalElapsedRef.current = 0;
      completedSecondsRef.current = 0;

      setSession(s);
      setCurrentIndex(0);
      setIsPlaying(true);
      setIsComplete(false);
      setTotalElapsed(0);

      await backgroundAudio.start();
      preGenerateTTS(s).catch(() => {});
      scheduleIntervalNotifications(s).catch(() => {});
      startInterval(0);
    },
    [getSession, backgroundAudio, startInterval]
  );

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      timer.pause();
      setIsPlaying(false);
    } else {
      timer.resume();
      setIsPlaying(true);
    }
  }, [isPlaying, timer]);

  const nextInterval = useCallback(() => {
    const s = sessionRef.current;
    const nextIdx = indexRef.current + 1;
    if (!s || nextIdx >= s.intervals.length) return;
    startInterval(nextIdx);
  }, [startInterval]);

  const prevInterval = useCallback(() => {
    const prevIdx = Math.max(0, indexRef.current - 1);
    startInterval(prevIdx);
  }, [startInterval]);

  const stopSession = useCallback(() => {
    timer.stop();
    backgroundAudio.stop();
    cancelAllNotifications();
    setSession(null);
    setIsPlaying(false);
    setIsComplete(false);
    setCurrentIndex(0);
    setSecondsLeft(0);
    setTotalElapsed(0);
    sessionRef.current = null;
  }, [timer, backgroundAudio]);

  const totalSessionSeconds = session
    ? session.intervals.reduce((sum, i) => sum + i.minutes * 60, 0)
    : 0;

  return (
    <PlayerContext.Provider
      value={{
        session,
        currentIndex,
        secondsLeft,
        isPlaying,
        isComplete,
        totalElapsed,
        totalSessionSeconds,
        startSession,
        togglePlayPause,
        nextInterval,
        prevInterval,
        stopSession,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
