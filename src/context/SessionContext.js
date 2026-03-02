import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PRESET_SESSIONS } from '../constants/presets';
import { loadCustomSessions, saveCustomSessions } from '../utils/storage';

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [customSessions, setCustomSessions] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCustomSessions().then((saved) => {
      setCustomSessions(saved);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveCustomSessions(customSessions);
  }, [customSessions, loaded]);

  const allSessions = [...PRESET_SESSIONS, ...customSessions];

  const getSession = useCallback(
    (id) => allSessions.find((s) => s.id === id),
    [customSessions]
  );

  const addSession = useCallback((session) => {
    const newSession = {
      ...session,
      id: `custom-${Date.now()}`,
      preset: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomSessions((prev) => [...prev, newSession]);
    return newSession.id;
  }, []);

  const updateSession = useCallback((id, updates) => {
    setCustomSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      )
    );
  }, []);

  const deleteSession = useCallback((id) => {
    setCustomSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <SessionContext.Provider
      value={{
        presets: PRESET_SESSIONS,
        customSessions,
        allSessions,
        getSession,
        addSession,
        updateSession,
        deleteSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSessions() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSessions must be used within SessionProvider');
  return ctx;
}
