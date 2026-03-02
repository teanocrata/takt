export function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getTotalMinutes(intervals) {
  return intervals.reduce((sum, i) => sum + i.minutes, 0);
}

export function getTotalSeconds(intervals) {
  return intervals.reduce((sum, i) => sum + i.minutes * 60, 0);
}
