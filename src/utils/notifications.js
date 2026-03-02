import * as Notifications from 'expo-notifications';

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') {
    await Notifications.setNotificationChannelAsync('takt-intervals', {
      name: 'Intervalos',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }
  return status === 'granted';
}

export async function scheduleIntervalNotifications(session) {
  await cancelAllNotifications();

  let cumulativeSeconds = 0;
  for (let i = 0; i < session.intervals.length; i++) {
    const interval = session.intervals[i];
    cumulativeSeconds += interval.minutes * 60;

    // Schedule notification for when this interval ends (= next interval starts)
    if (i < session.intervals.length - 1) {
      const nextInterval = session.intervals[i + 1];
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Takt',
          body: nextInterval.name,
          sound: 'default',
          categoryIdentifier: 'takt-intervals',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.round(cumulativeSeconds),
          channelId: 'takt-intervals',
        },
      });
    }
  }

  // Schedule session complete notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Takt',
      body: 'Sesion completada!',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.round(cumulativeSeconds),
      channelId: 'takt-intervals',
    },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
