let scheduledTimeouts = [];

export async function requestNotificationPermissions() {
  if (!('Notification' in window)) {
    console.warn('Web Notifications API not supported');
    return false;
  }
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function scheduleIntervalNotifications(session) {
  await cancelAllNotifications();

  let cumulativeMs = 0;
  for (let i = 0; i < session.intervals.length; i++) {
    const interval = session.intervals[i];
    cumulativeMs += interval.minutes * 60 * 1000;

    if (i < session.intervals.length - 1) {
      const nextInterval = session.intervals[i + 1];
      const id = setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('Takt', { body: nextInterval.name });
        }
      }, cumulativeMs);
      scheduledTimeouts.push(id);
    }
  }

  // Session complete notification
  const id = setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('Takt', { body: 'Sesion completada!' });
    }
  }, cumulativeMs);
  scheduledTimeouts.push(id);
}

export async function cancelAllNotifications() {
  scheduledTimeouts.forEach(clearTimeout);
  scheduledTimeouts = [];
}
