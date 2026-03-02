import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { getTypeColor } from '../constants/types';
import { getTotalMinutes } from '../utils/formatTime';

export default function SessionCard({ session, onPress, onEdit, onDelete }) {
  const totalMin = Math.round(getTotalMinutes(session.intervals));

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {session.name}
          </Text>
          <Text style={styles.duration}>{totalMin} min</Text>
        </View>
        {session.description && (
          <Text style={styles.description} numberOfLines={1}>
            {session.description}
          </Text>
        )}
      </View>

      {/* Color bar showing interval proportions */}
      <View style={styles.colorBar}>
        {session.intervals.map((interval, idx) => (
          <View
            key={idx}
            style={[
              styles.colorSegment,
              {
                flex: interval.minutes,
                backgroundColor: getTypeColor(interval.type),
              },
              idx === 0 && styles.colorSegmentFirst,
              idx === session.intervals.length - 1 && styles.colorSegmentLast,
            ]}
          />
        ))}
      </View>

      {!session.preset && (onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <Pressable onPress={onEdit} style={styles.actionBtn}>
              <Text style={styles.actionText}>Editar</Text>
            </Pressable>
          )}
          {onDelete && (
            <Pressable onPress={onDelete} style={styles.actionBtn}>
              <Text style={[styles.actionText, styles.deleteText]}>Eliminar</Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    backgroundColor: colors.surface2,
  },
  header: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  duration: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textMuted,
  },
  description: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  colorBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  colorSegment: {
    height: '100%',
  },
  colorSegmentFirst: {
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  colorSegmentLast: {
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.accent,
  },
  deleteText: {
    color: colors.danger,
  },
});
