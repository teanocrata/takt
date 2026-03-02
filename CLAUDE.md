# CLAUDE.md — Takt

## What is Takt

Takt is a voice-guided interval timer. It lets users create sessions composed of named, timed intervals and plays them sequentially with TTS voice alerts, vibration, and notifications. The name comes from German: the beat a conductor sets for an orchestra.

The first use case is equestrian training (dressage, lunging, jumping), but the app is generic and works for any interval-based activity: cooking, HIIT, meditation, physiotherapy, etc.

## Current state

A PWA prototype exists (index.html + manifest.json + sw.js) that validates the concept but has a critical limitation: on Android, when the screen is off, Chrome suspends the process and the timer stops. This makes the PWA unviable for real use (the user carries the phone in their pocket while riding).

The next step is migrating to a native app with Expo/React Native for real access to foreground services, native audio, and scheduled notifications.

## Tech stack

- **Framework:** Expo (React Native)
- **Language:** JavaScript (user prefers JS over TS, but is open to TypeScript if it adds value)
- **Target platform:** Android (user has a Fairphone 5)
- **iOS:** Not a priority now, but Expo allows building for iOS in the future

## Core features (MVP)

### Session player
- Play a session: a sequence of intervals that execute one after another
- Each interval has: name (string), duration (minutes, accepts decimals e.g. 0.5 = 30s), type (paso, trote, galope, lateral, descanso, salto — these types are from the equestrian use case but must be extensible)
- Each type has an associated color for the UI
- Visual countdown showing remaining time for the current interval
- Progress bar for the current interval
- Total elapsed time / total session time indicator
- Dots showing all intervals and which one is active
- Controls: play/pause, next, previous
- Current exercise name and next exercise name visible

### Alerts (all individually toggleable)
- **Voice (TTS):** Announces interval name on change. Use expo-speech with language es-ES
- **Vibration:** Vibration pattern on interval change. Use expo-haptics
- **10-second warning:** Voice says "Diez segundos" and short vibration before each change
- **Notifications:** System notification on interval change (important for screen-off). Use expo-notifications

### Background execution (CRITICAL)
This is the most important requirement and the reason for migrating from PWA to native. The app MUST keep working with:
- Screen off
- App in background
- Phone in pocket

Recommended strategy:
- Use expo-av to play audio (TTS or a sound) which keeps the audio service active
- Use expo-task-manager and expo-background-fetch if needed
- Use expo-notifications to schedule notifications with each interval's timing when starting a session (so even if the process is suspended, notifications will arrive)
- Use expo-keep-awake as a complement (not as the primary solution)

### Media Session / Lock screen controls
- Show current exercise name in Android media controls
- Allow pause/play/next/prev from the lock screen

### Session management
- **Preset sessions:** Come preloaded (see "Example equestrian sessions" section)
- **Custom sessions:** User can create, edit, and delete sessions
- Persistence with AsyncStorage
- Session editor with:
  - Name and description
  - Interval list with drag & drop to reorder
  - Quick-add buttons for predefined intervals (e.g. "Walk 5min", "Trot 5min", etc.)
  - Type and duration selector

### Settings
- Toggle voice on/off
- Toggle vibration on/off
- Toggle 10-second warning on/off
- Toggle keep screen awake on/off

## Example equestrian sessions (presets)

Equestrian interval types and their colors:
- paso: #5b8a72 (walk)
- trote: #c87941 (trot)
- galope: #b85450 (canter/gallop)
- lateral: #6b7db3 (lateral work)
- descanso: #7a7a6a (rest)
- salto: #9b6b9e (jumping)

Note: UI labels for these types should be in Spanish.

### Week 1-2 · Lunging (28 min)
1. Paso calentamiento — 5 min — paso
2. Trote mano izquierda — 4 min — trote
3. Paso — 2 min — descanso
4. Trote mano derecha — 4 min — trote
5. Paso — 2 min — descanso
6. Galope mano izquierda — 2 min — galope
7. Paso — 2 min — descanso
8. Galope mano derecha — 2 min — galope
9. Paso vuelta a la calma — 5 min — paso

### Week 1-2 · Mounted (31 min)
1. Paso calentamiento rienda larga — 5 min — paso
2. Trote de trabajo, transiciones — 5 min — trote
3. Cesiones de pierna al paso — 3 min — lateral
4. Trote con espaldas adentro — 4 min — lateral
5. Descanso al paso — 3 min — descanso
6. Galope corto, transiciones — 3 min — galope
7. Trote - galope - trote — 3 min — trote
8. Paso vuelta a la calma — 5 min — paso

### Week 3-4 · Mounted (40 min)
1. Paso calentamiento — 5 min — paso
2. Trote de trabajo — 5 min — trote
3. Espaldas adentro al trote — 4 min — lateral
4. Descanso al paso — 2 min — descanso
5. Galope mano izquierda — 4 min — galope
6. Trocado — 3 min — galope
7. Descanso al paso — 2 min — descanso
8. Galope mano derecha — 4 min — galope
9. Espaldas adentro al galope — 3 min — lateral
10. Trote - transiciones — 3 min — trote
11. Paso vuelta a la calma — 5 min — paso

### Week 5-6 · Full mounted session (48 min)
1. Paso calentamiento — 5 min — paso
2. Trote de trabajo, transiciones — 5 min — trote
3. Espaldas adentro trote — 4 min — lateral
4. Cesión de pierna al trote — 3 min — lateral
5. Descanso al paso — 2 min — descanso
6. Galope - transiciones — 5 min — galope
7. Espaldas adentro al galope — 3 min — lateral
8. Trocado — 3 min — galope
9. Descanso al paso — 2 min — descanso
10. Cruzadas y verticales — 5 min — salto
11. Galope recuperación — 3 min — galope
12. Trote vuelta a la calma — 3 min — trote
13. Paso final — 5 min — paso

### Week 7+ · Full session (53 min)
1. Paso calentamiento — 5 min — paso
2. Trote de trabajo — 5 min — trote
3. Espaldas adentro trote — 4 min — lateral
4. Cesión y contra-espalda trote — 4 min — lateral
5. Descanso al paso — 2 min — descanso
6. Galope mano izquierda — 4 min — galope
7. Espaldas adentro galope — 3 min — lateral
8. Trocado — 3 min — galope
9. Cambios de pie aislados — 4 min — galope
10. Descanso al paso — 3 min — descanso
11. Cruzadas y verticales — 8 min — salto
12. Galope recuperación — 3 min — galope
13. Paso vuelta a la calma — 5 min — paso

### Quick test (3 min)
30-second intervals to test that voice, vibration, and notifications work:
1. Paso calentamiento — 0.5 min — paso
2. Trote de trabajo — 0.5 min — trote
3. Espaldas adentro — 0.5 min — lateral
4. Galope — 0.5 min — galope
5. Cruzadas — 0.5 min — salto
6. Descanso al paso — 0.5 min — descanso

## Design and UX

### Aesthetics
- Dark theme (background #1a1a1a, surfaces #242424)
- Typography: DM Sans (UI) + DM Mono (timers and counters)
- Accent color: #c87941 (warm, leather/wood tone)
- No emojis in final UI
- Minimalist, functional, designed for quick glances while riding

### Screens
1. **Session list:** Shows presets and custom sessions as cards with color bars representing intervals. Button to create new session.
2. **Player:** Main screen during a session. Exercise name large and colored by type. Large countdown. Play/pause/next/prev controls. Progress dots.
3. **Session complete:** Summary with total time and exercise count.
4. **Session editor:** Form to create/edit sessions with interval list.
5. **Settings:** Toggles for voice, vibration, 10s warning, keep screen awake.

### Navigation
Simple stack navigation: List → Player → Complete, or List → Editor. Settings can be a modal or bottom sheet.

## Data structures

```typescript
interface IntervalType {
  id: string;        // 'paso', 'trote', etc.
  label: string;     // 'Paso', 'Trote', etc.
  color: string;     // '#5b8a72'
}

interface Interval {
  name: string;      // 'Espaldas adentro al trote'
  minutes: number;   // 4 (accepts decimals: 0.5 = 30s)
  type: string;      // references IntervalType.id
}

interface Session {
  id: string;
  name: string;
  description?: string;
  intervals: Interval[];
  preset: boolean;   // true = preloaded, not editable
  createdAt?: string;
  updatedAt?: string;
}

interface Settings {
  voice: boolean;
  vibrate: boolean;
  warning: boolean;    // 10-second warning
  keepAwake: boolean;
}
```

## Recommended Expo dependencies

- expo-av — Audio to keep service alive in background
- expo-speech — Text-to-speech
- expo-haptics — Vibration
- expo-notifications — Scheduled notifications
- expo-keep-awake — Keep screen on
- expo-task-manager — Background tasks if needed
- @react-native-async-storage/async-storage — Local persistence
- react-native-reanimated — Smooth animations
- react-native-gesture-handler — Drag & drop in editor

## Testing on device

The user has a Fairphone 5 (Android). For development:
1. Install Expo Go on the Fairphone
2. `npx expo start` on PC
3. Scan QR from Expo Go

For native features that Expo Go doesn't support (like background audio), use a development build:
1. `npx expo run:android` with phone connected via USB
2. Or `eas build --profile development --platform android` for cloud builds

## Repository

- GitHub repo: takt
- The original PWA (index.html, manifest.json, sw.js) can stay in a /pwa folder or a separate branch for reference
- The Expo project goes in the root

## Conventions

- Code, comments, documentation, commit messages: English
- UI content and labels: Spanish
- Commit format: conventional commits (feat:, fix:, refactor:, docs:)
- Standard Expo folder structure

## Implementation priorities

1. Expo setup + basic navigation
2. Working player with timer that runs in background (the most critical requirement)
3. TTS + vibration + notifications
4. Session list with presets loaded
5. Custom session persistence
6. Session editor
7. Settings
8. Media session / lock screen controls
9. Polish UX and animations
