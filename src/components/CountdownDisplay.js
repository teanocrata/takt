import { Text, StyleSheet } from 'react-native';
import { formatTime } from '../utils/formatTime';
import { fonts } from '../constants/theme';

export default function CountdownDisplay({ seconds, color }) {
  return (
    <Text style={[styles.countdown, { color }]}>{formatTime(seconds)}</Text>
  );
}

const styles = StyleSheet.create({
  countdown: {
    fontFamily: fonts.mono,
    fontSize: 96,
    lineHeight: 110,
    textAlign: 'center',
  },
});
