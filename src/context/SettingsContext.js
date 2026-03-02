import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadSettings, saveSettings } from '../utils/storage';

const DEFAULT_SETTINGS = {
  voice: true,
  vibrate: true,
  warning: true,
  keepAwake: true,
};

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings().then((saved) => {
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...saved });
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveSettings(settings);
  }, [settings, loaded]);

  const toggleSetting = useCallback((key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, toggleSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
