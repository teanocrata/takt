import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { getTypeColor, getTypeLabel } from '../constants/types';
import { colors, fonts, spacing, radius } from '../constants/theme';

export default function IntervalItem({ interval, index, onUpdate, onDelete }) {
  const typeColor = getTypeColor(interval.type);

  return (
    <View style={styles.container}>
      <View style={[styles.typeBar, { backgroundColor: typeColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.index}>{index + 1}</Text>
          <TextInput
            style={styles.nameInput}
            value={interval.name}
            onChangeText={(text) => onUpdate({ ...interval, name: text })}
            placeholderTextColor={colors.textMuted}
            placeholder="Nombre del intervalo"
          />
          <Pressable onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteIcon}>✕</Text>
          </Pressable>
        </View>
        <View style={styles.bottomRow}>
          <Text style={[styles.typeBadge, { color: typeColor }]}>
            {getTypeLabel(interval.type)}
          </Text>
          <View style={styles.durationRow}>
            <TextInput
              style={styles.durationInput}
              value={String(interval.minutes)}
              onChangeText={(text) => {
                const num = parseFloat(text) || 0;
                onUpdate({ ...interval, minutes: num });
              }}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.minLabel}>min</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  index: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
    width: 20,
  },
  nameInput: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  deleteIcon: {
    fontSize: 14,
    color: colors.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingLeft: 28,
  },
  typeBadge: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  durationInput: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    width: 50,
    textAlign: 'center',
  },
  minLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
  },
});
