import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSessions } from '../src/context/SessionContext';
import SessionCard from '../src/components/SessionCard';
import { colors, fonts, spacing, radius } from '../src/constants/theme';

export default function SessionListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { presets, customSessions, deleteSession } = useSessions();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>Takt</Text>
        <Pressable
          style={styles.settingsBtn}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preset sessions */}
        <Text style={styles.sectionTitle}>Plan de puesta en forma</Text>
        {presets.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onPress={() =>
              router.push({ pathname: '/player', params: { sessionId: session.id } })
            }
          />
        ))}

        {/* Custom sessions */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>
          Mis sesiones
        </Text>
        {customSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Aun no tienes sesiones personalizadas
            </Text>
          </View>
        ) : (
          customSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onPress={() =>
                router.push({
                  pathname: '/player',
                  params: { sessionId: session.id },
                })
              }
              onEdit={() =>
                router.push({
                  pathname: '/editor',
                  params: { sessionId: session.id },
                })
              }
              onDelete={() => deleteSession(session.id)}
            />
          ))
        )}

        {/* Spacer for button */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* New session button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          style={({ pressed }) => [styles.newBtn, pressed && styles.newBtnPressed]}
          onPress={() => router.push('/editor')}
        >
          <Text style={styles.newBtnText}>+ Nueva sesion</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  brand: {
    fontFamily: fonts.sansBold,
    fontSize: 28,
    color: colors.accent,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
    color: colors.textMuted,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.textMuted,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: colors.bg,
  },
  newBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  newBtnPressed: {
    backgroundColor: colors.accentLight,
  },
  newBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: '#ffffff',
  },
});
