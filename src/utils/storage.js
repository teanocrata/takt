import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  sessions: 'takt-custom-sessions',
  settings: 'takt-settings',
};

export async function loadCustomSessions() {
  try {
    const json = await AsyncStorage.getItem(KEYS.sessions);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveCustomSessions(sessions) {
  await AsyncStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
}

export async function loadSettings() {
  try {
    const json = await AsyncStorage.getItem(KEYS.settings);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}
