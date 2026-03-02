import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';

export default function SettingRow({ label, description, value, onToggle }) {
  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.surface2, true: colors.accent }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  textCol: {
    flex: 1,
    marginRight: spacing.lg,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: colors.text,
  },
  description: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
