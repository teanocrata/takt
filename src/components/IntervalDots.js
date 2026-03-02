import { View, StyleSheet } from 'react-native';
import { getTypeColor } from '../constants/types';
import { spacing } from '../constants/theme';

export default function IntervalDots({ intervals, currentIndex }) {
  return (
    <View style={styles.container}>
      {intervals.map((interval, idx) => {
        const isActive = idx === currentIndex;
        const isDone = idx < currentIndex;
        return (
          <View
            key={idx}
            style={[
              styles.dot,
              {
                backgroundColor: getTypeColor(interval.type),
                opacity: isActive ? 1 : isDone ? 0.6 : 0.3,
                transform: [{ scale: isActive ? 1.3 : 1 }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    maxWidth: 300,
    alignSelf: 'center',
    paddingVertical: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
