import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatTime } from '../src/utils/formatTime';
import { colors, fonts, spacing, radius } from '../src/constants/theme';

export default function CompleteScreen() {
  const { sessionName, totalTime, intervalCount } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.title}>Sesion completada!</Text>
        <Text style={styles.sessionName}>{sessionName}</Text>

        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {formatTime(Number(totalTime) || 0)}
            </Text>
            <Text style={styles.statLabel}>Tiempo total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{intervalCount || 0}</Text>
            <Text style={styles.statLabel}>Ejercicios</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.btnText}>Volver al inicio</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  checkmark: {
    fontSize: 64,
    color: colors.accent,
    marginBottom: spacing.xxl,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sessionName: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.xxxl,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xxxxl,
  },
  statBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 130,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontFamily: fonts.monoMedium,
    fontSize: 24,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxxl,
  },
  btnPressed: {
    backgroundColor: colors.accentLight,
  },
  btnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: '#ffffff',
  },
});
