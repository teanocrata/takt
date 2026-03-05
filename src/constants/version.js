import Constants from 'expo-constants';

export const VERSION = Constants.expoConfig?.version ?? '0.1.0';
export const BUILD = Constants.expoConfig?.extra?.commitHash ?? 'dev';
export const VERSION_DISPLAY = `v${VERSION} (${BUILD})`;
