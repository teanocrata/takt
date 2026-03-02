import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';

export default function PlayerControls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  canPrev,
  canNext,
}) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.btn, styles.smallBtn, !canPrev && styles.btnDisabled]}
        onPress={onPrev}
        disabled={!canPrev}
      >
        <Text style={[styles.btnIcon, !canPrev && styles.iconDisabled]}>⏮</Text>
      </Pressable>

      <Pressable
        style={[styles.btn, styles.playBtn]}
        onPress={onPlayPause}
      >
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </Pressable>

      <Pressable
        style={[styles.btn, styles.smallBtn, !canNext && styles.btnDisabled]}
        onPress={onNext}
        disabled={!canNext}
      >
        <Text style={[styles.btnIcon, !canNext && styles.iconDisabled]}>⏭</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  smallBtn: {
    width: 56,
    height: 56,
    backgroundColor: colors.surface,
  },
  playBtn: {
    width: 72,
    height: 72,
    backgroundColor: colors.accent,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnIcon: {
    fontSize: 22,
    color: colors.text,
  },
  iconDisabled: {
    color: colors.textMuted,
  },
  playIcon: {
    fontSize: 28,
    color: '#ffffff',
  },
});
