import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../src/context/SettingsContext';
import SettingRow from '../src/components/SettingRow';
import { colors, fonts, spacing } from '../src/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, toggleSetting } = useSettings();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Ajustes</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>Cerrar</Text>
        </Pressable>
      </View>

      <View style={styles.settings}>
        <SettingRow
          label="Voz"
          description="Anuncia el ejercicio al cambiar"
          value={settings.voice}
          onToggle={() => toggleSetting('voice')}
        />
        <SettingRow
          label="Vibracion"
          description="Vibra al cambiar de intervalo"
          value={settings.vibrate}
          onToggle={() => toggleSetting('vibrate')}
        />
        <SettingRow
          label="Aviso 10 segundos"
          description="Avisa antes de cada cambio"
          value={settings.warning}
          onToggle={() => toggleSetting('warning')}
        />
        <SettingRow
          label="Pantalla encendida"
          description="Mantiene la pantalla activa"
          value={settings.keepAwake}
          onToggle={() => toggleSetting('keepAwake')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 24,
    color: colors.text,
  },
  closeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  closeText: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: colors.accent,
  },
  settings: {
    marginTop: spacing.md,
  },
});
