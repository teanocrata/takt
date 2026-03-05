import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SessionProvider } from '../src/context/SessionContext';
import { SettingsProvider } from '../src/context/SettingsContext';
import { PlayerProvider } from '../src/context/PlayerContext';
import { requestNotificationPermissions } from '../src/utils/notifications';
import { colors } from '../src/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'DMSans-Regular': require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium': require('../assets/fonts/DMSans-Medium.ttf'),
    'DMSans-Bold': require('../assets/fonts/DMSans-Bold.ttf'),
    'DMMono-Regular': require('../assets/fonts/DMMono-Regular.ttf'),
    'DMMono-Medium': require('../assets/fonts/DMMono-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  // On web, useFonts registers @font-face but may never flip to true;
  // the fonts are still usable, so skip the gate on web.
  if (!fontsLoaded && Platform.OS !== 'web') return null;

  return (
    <SettingsProvider>
      <SessionProvider>
        <PlayerProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="player" />
            <Stack.Screen name="complete" />
            <Stack.Screen name="editor" />
            <Stack.Screen
              name="settings"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </PlayerProvider>
      </SessionProvider>
    </SettingsProvider>
  );
}
