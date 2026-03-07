# CLAUDE.md — Takt

## What is Takt

Takt is a voice-guided interval timer. It lets users create sessions composed of named, timed intervals and plays them sequentially with TTS voice alerts, vibration, and notifications. The name comes from German: the beat a conductor sets for an orchestra.

The first use case is equestrian training (dressage, lunging, jumping), but the app is generic and works for any interval-based activity: cooking, HIIT, meditation, physiotherapy, etc.

## Current state

Single Expo codebase that builds for both **web** and **native Android** from the same source.

- **Web (PWA):** Live at https://teanocrata.github.io/takt/ — fully functional including background execution with screen off on Android Chrome
- **Native Android:** APK built via GitHub Actions — uses foreground service for background execution
- **iOS:** Not built yet, but Expo supports it when needed

Both platforms deploy automatically on push to `main` via GitHub Actions.

## Tech stack

- **Framework:** Expo SDK 55 (React Native) with `npx expo export --platform web` for web builds
- **Language:** JavaScript (user prefers JS over TS)
- **Target platforms:** Android (Fairphone 5) + Web (GitHub Pages)
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
- **Voice (TTS):** Announces interval name on change
  - Native: `expo-speech` with `es-ES`
  - Web: Edge TTS via Cloudflare Worker (`takt-tts.teanocrata.workers.dev`, voice `es-ES-ElviraNeural`), falls back to `speechSynthesis`
- **Vibration:** Vibration pattern on interval change
  - Native: `expo-haptics`
  - Web: `navigator.vibrate()`
- **10-second warning:** Voice says "Diez segundos" and short vibration before each change
- **Notifications:** System notification on interval change
  - Native: `expo-notifications` with `TIME_INTERVAL` scheduled triggers
  - Web: Web Notifications API with `setTimeout` scheduling

### Background execution (CRITICAL)
The app MUST keep working with screen off, app in background, phone in pocket.

**Native Android implementation:**
- `expo-audio` plays a looped `silence.wav` at volume 0.01 to keep the audio service alive
- `player.setActiveForLockScreen(true)` starts the `AudioControlsService` foreground service — **required** for sustained background playback (without it Android kills the JS thread after ~3 min)
- `interruptionMode: 'doNotMix'` is required by expo-audio when using `setActiveForLockScreen` (trade-off: other audio apps pause while session is running)
- `expo-notifications` schedules all interval notifications upfront so they fire even if the process is suspended
- `setInterval(tick, 250)` in JS main thread for the countdown timer
- `AppState` listener to force a tick on foreground resume

**Web implementation (works with screen off on Android Chrome):**
- Web Worker with `setInterval` for un-throttled timer ticks (Chrome throttles main-thread timers in background tabs)
- `<audio>` element plays a 2-second in-memory WAV (alternating ±1 samples) in a loop at volume 0.01 — Chrome Android uses `AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK` for audio <5s, which ducks other apps briefly instead of pausing them (Spotify keeps playing)
- Edge TTS via Cloudflare Worker for background-capable TTS (Web Speech API stops working when tab is backgrounded)
- TTS audio is pre-fetched for all interval names at session start and cached in memory
- Web Notifications API for interval change notifications

### Media Session / Lock screen controls
- Native: `setActiveForLockScreen` shows current exercise name in Android media notification, updated on each interval change via `updateLockScreenMetadata`
- Web: not implemented yet

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

## Platform-specific file architecture

Metro resolves `.web.js` vs `.native.js` automatically based on the target platform. Four modules have platform-specific implementations:

| Module | Native (`.native.js`) | Web (`.web.js`) |
|--------|----------------------|-----------------|
| `useTimer` | `setInterval` + `AppState` listener | Web Worker (un-throttled in background) |
| `useAlerts` | `expo-speech` + `expo-haptics` | Edge TTS via Cloudflare Worker + `navigator.vibrate()` |
| `useBackgroundAudio` | `expo-audio` + foreground service | `<audio>` element with in-memory WAV |
| `notifications` | `expo-notifications` (scheduled) | Web Notifications API + `setTimeout` |

All other code (PlayerContext, SessionContext, SettingsContext, UI components, navigation) is shared.

## Expo dependencies

- expo-audio — Background audio keepalive + foreground service (native), replaced expo-av
- expo-speech — Text-to-speech (native only)
- expo-haptics — Vibration (native only)
- expo-notifications — Scheduled notifications (native only)
- expo-keep-awake — Keep screen on
- @react-native-async-storage/async-storage — Local persistence
- react-native-reanimated — Smooth animations
- react-native-gesture-handler — Drag & drop in editor
- expo-font — DM Sans + DM Mono

## Deployment and CI/CD

Both workflows trigger on push to `main` and on `workflow_dispatch`:

### Web → GitHub Pages
- Workflow: `.github/workflows/deploy-pages.yml`
- Runs `npx expo export --platform web` with `EXPO_BASE_URL=/takt`
- `app.config.js` reads `EXPO_BASE_URL` and sets `experiments.baseUrl` for correct asset paths under the `/takt` subpath
- Deploys to https://teanocrata.github.io/takt/
- Takes ~1 minute

### Android → APK artifact
- Workflow: `.github/workflows/build-android.yml`
- Runs `npx expo prebuild --platform android --clean` + `./gradlew assembleRelease`
- Uploads APK as artifact (30-day retention)
- Takes ~28 minutes

### Cloudflare Worker — Edge TTS proxy

**Why it exists:**
The Web Speech API (`speechSynthesis`) stops working when the browser tab is backgrounded on Android Chrome. Since Takt must announce intervals with the screen off, we need an alternative. Edge TTS (Microsoft's neural TTS service) produces high-quality audio, but it requires a WebSocket connection with specific headers (`Origin`, `Sec-MS-GEC` token) that browsers cannot send from client-side JS. The Cloudflare Worker acts as a proxy: the browser sends a simple POST request, the Worker opens the WebSocket to Edge TTS and returns the generated MP3.

**How it works:**
1. At session start, the web client (`src/hooks/useAlerts.web.js`) pre-fetches TTS audio for all interval names by POSTing to the Worker
2. The Worker (`tts-worker/worker.js`) connects to `speech.platform.bing.com` via WebSocket, sends SSML, and streams back MP3 chunks
3. The MP3 is cached in-memory on the client; during playback it's played via `<audio>` element (works in background)
4. If the Worker is unreachable, falls back to `speechSynthesis` (foreground only)

**Endpoint:**
- URL: `https://takt-tts.teanocrata.workers.dev/tts`
- Method: `POST`
- Body: `{ "text": "Trote de trabajo", "voice": "es-ES-ElviraNeural" }`
- Response: `audio/mpeg` (MP3)
- Optional params: `rate` (default `-10%`), `pitch` (default `+0Hz`)
- CORS: allows all origins

**Source code:** `tts-worker/worker.js` + `tts-worker/wrangler.toml`

**Deploying / updating the Worker:**
```bash
cd tts-worker
npx wrangler login        # one-time: authenticates with Cloudflare account
npx wrangler deploy       # deploys to takt-tts.teanocrata.workers.dev
```

**Cloudflare dashboard:**
- Log in at https://dash.cloudflare.com → Workers & Pages → `takt-tts`
- Shows request metrics, logs, and allows editing the Worker online
- The Worker runs on the free tier (100k requests/day)

**Notes:**
- No `account_id` in `wrangler.toml` — it uses whichever account is authenticated via `wrangler login`
- The Worker is not deployed automatically by CI; changes to `tts-worker/` must be deployed manually
- The `TRUSTED_CLIENT_TOKEN` and `Sec-MS-GEC` generation mimic the Edge browser's TTS protocol — if Microsoft changes the protocol, the Worker may need updating
- Native Android does not use this Worker; it uses `expo-speech` directly

## Testing on device

The user has a Fairphone 5 (Android). For development:
1. Install Expo Go on the Fairphone
2. `npx expo start` on PC
3. Scan QR from Expo Go

For native features that Expo Go doesn't support (like background audio), use a development build:
1. `npx expo run:android` with phone connected via USB
2. Or `eas build --profile development --platform android` for cloud builds

For web testing: `npx expo start --web` or `npx expo export --platform web` + serve `dist/`

## Repository

- GitHub repo: teanocrata/takt
- Web: https://teanocrata.github.io/takt/
- The Expo project is in the root

## Conventions

- Code, comments, documentation, commit messages: English
- UI content and labels: Spanish
- Commit format: conventional commits (feat:, fix:, refactor:, docs:)
- Standard Expo folder structure

## Implementation status

Done:
1. Expo setup + navigation (expo-router)
2. Working player with timer that runs in background (web + native)
3. TTS + vibration + notifications (platform-specific implementations)
4. Session list with presets loaded
5. Custom session persistence (AsyncStorage)
6. Session editor
7. Settings
8. Web deployment (GitHub Pages) + Android APK (GitHub Actions)
9. Lock screen metadata on native (current interval name)

Pending:
- Lock screen play/pause/next/prev controls on native
- Web media session integration
- Polish UX and animations
