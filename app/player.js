import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { usePlayer } from '../src/context/PlayerContext';
import { useSettings } from '../src/context/SettingsContext';
import { getTypeColor } from '../src/constants/types';
import { formatTime } from '../src/utils/formatTime';
import CountdownDisplay from '../src/components/CountdownDisplay';
import IntervalDots from '../src/components/IntervalDots';
import ProgressBar from '../src/components/ProgressBar';
import PlayerControls from '../src/components/PlayerControls';
import { colors, fonts, spacing, radius } from '../src/constants/theme';

export default function PlayerScreen() {
  const { sessionId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();

  const {
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
  } = usePlayer();

  // Start the session on mount
  useEffect(() => {
    if (sessionId) startSession(sessionId);
    return () => {
      // Cleanup handled by stopSession when navigating away
    };
  }, [sessionId]);

  // Keep screen awake
  useEffect(() => {
    if (settings.keepAwake && isPlaying) {
      activateKeepAwakeAsync().catch(() => {});
    } else {
      deactivateKeepAwake().catch(() => {});
    }
    return () => { deactivateKeepAwake().catch(() => {}); };
  }, [settings.keepAwake, isPlaying]);

  // Navigate to complete screen when session is done
  useEffect(() => {
    if (isComplete && session) {
      router.replace({
        pathname: '/complete',
        params: {
          sessionName: session.name,
          totalTime: Math.round(totalElapsed),
          intervalCount: session.intervals.length,
        },
      });
    }
  }, [isComplete]);

  if (!session) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const currentInterval = session.intervals[currentIndex];
  const nextIntervalData =
    currentIndex < session.intervals.length - 1
      ? session.intervals[currentIndex + 1]
      : null;
  const typeColor = getTypeColor(currentInterval.type);
  const intervalDuration = currentInterval.minutes * 60;
  const progress = intervalDuration > 0 ? 1 - secondsLeft / intervalDuration : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Session title */}
      <Text style={styles.sessionName}>{session.name}</Text>

      {/* Interval dots */}
      <IntervalDots intervals={session.intervals} currentIndex={currentIndex} />

      {/* Current interval info */}
      <View style={styles.intervalInfo}>
        <Text style={styles.label}>Ejercicio actual</Text>
        <Text style={[styles.intervalName, { color: typeColor }]}>
          {currentInterval.name}
        </Text>
        <Text style={styles.nextLabel}>
          {nextIntervalData
            ? `Siguiente: ${nextIntervalData.name}`
            : 'Ultimo ejercicio'}
        </Text>
      </View>

      {/* Countdown */}
      <CountdownDisplay seconds={secondsLeft} color={typeColor} />

      {/* Total time */}
      <Text style={styles.totalTime}>
        {formatTime(totalElapsed)} / {formatTime(totalSessionSeconds)}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} color={typeColor} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onNext={nextInterval}
          onPrev={prevInterval}
          canPrev={currentIndex > 0}
          canNext={currentIndex < session.intervals.length - 1}
        />
      </View>

      {/* Stop button */}
      <Pressable
        style={styles.stopBtn}
        onPress={() => {
          stopSession();
          router.back();
        }}
      >
        <Text style={styles.stopText}>Terminar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 100,
  },
  sessionName: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  intervalInfo: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  intervalName: {
    fontFamily: fonts.sansBold,
    fontSize: 24,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  nextLabel: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  totalTime: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  progressContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  controls: {
    marginTop: spacing.xxxl,
  },
  stopBtn: {
    alignSelf: 'center',
    marginTop: spacing.xxl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  stopText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.danger,
  },
});
