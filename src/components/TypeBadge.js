import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';

export default function TypeBadge({ label, color, selected, onPress }) {
  return (
    <Pressable
      style={[
        styles.badge,
        { borderColor: color },
        selected && { backgroundColor: color + '30' },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
  },
});
