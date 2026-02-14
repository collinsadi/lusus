# Lusus

**Find the shape that wasn't there.** A reverse memory game for iOS and Android. Memorize the shapes, spot the odd one out before time runs out, and build your streak. One mistake resets everything.

Built with **Expo**, **React Native**, and **TypeScript**. This README is a technical map for contributors.

---

## Quick start

**Prerequisites:** Node.js 18+, iOS Simulator / Android Emulator or device

```bash
npm install
npm start
# Then: npm run ios  or  npm run android
```

**Path alias:** `@/` → `src/` (e.g. `@/context/puzzle-context` → `src/context/puzzle-context.tsx`).

---

## Codebase map

### App entry and routing

- **`src/app/_layout.tsx`** — Root layout. Wraps app in `SplashProvider` → `PuzzleProvider` → `MultiplayerProvider`, then renders `Stack` with all screens. Renders `SplashScreen` overlay when `shouldShowSplash`. **Add new global providers or stack screens here.**
- **`src/app/(tabs)/_layout.tsx`** — Tab layout. Defines tab stack: `index`, `explore`, `multiplayer`.
- **Screens (where to go for what):**

| Screen | Path | Purpose |
|--------|------|---------|
| Main puzzle feed | `src/app/(tabs)/index.tsx` | Vertical swipeable feed, uses `usePuzzleFeed` + `PuzzleRenderer`, shows `StatsDisplay`, `TutorialOverlay`, `FeedbackOverlay`. |
| Explore | `src/app/(tabs)/explore.tsx` | Secondary tab content. |
| Multiplayer hub | `src/app/(tabs)/multiplayer.tsx` | Entry to multiplayer; navigates to lobby. |
| Multiplayer lobby | `src/app/multiplayer-lobby.tsx` | Create/join room, set username/emoji, configure target streak & time limit. |
| Multiplayer game | `src/app/multiplayer-game.tsx` | In-game screen; same puzzle feed with shared progress. |
| Multiplayer results | `src/app/multiplayer-results.tsx` | Post-game leaderboard and share. |
| Rules (modal) | `src/app/rules.tsx` | Modal with rules. |
| Splash | `src/app/splash.tsx` | In-app splash with random note and play button. |
| Modal | `src/app/modal.tsx` | Generic modal. |

---

### Puzzle system

Single-player puzzles are driven by **types → registry → generators/evaluators → engine → renderer**.

- **Types** — `src/types/puzzle.ts`  
  `PuzzleType` enum, `PuzzleDefinition`, `PuzzleInstance`, `PuzzleCoreData` (e.g. `ReverseMemoryPuzzleData`), `PuzzleGenerator`, `PuzzleEvaluator`, `SessionStats`, etc. **Add a new puzzle type: extend enums and add `*Config` / `*PuzzleData` interfaces here.**

- **Registry** — `src/services/puzzles/puzzle-registry.ts`  
  Singleton that holds all generators and evaluators. `generatePuzzle(type, baseSeed, index, difficulty?, streakMilestone?)`, `generateRandomPuzzle()`. **Register new puzzle type here in `initializeRegistry()`.**

- **Generators** — `src/services/puzzles/generators/`  
  One file per type: `reverse-memory-generator.ts`, `oddity-generator.ts`, `timing-generator.ts`, `rotation-generator.ts`, `rule-switch-generator.ts`. Each implements `PuzzleGenerator`: `generateDefinition()`, `generateData()`. **Add a new generator in this folder and register it in the registry.**

- **Evaluators** — `src/services/puzzles/evaluators/`  
  One file per type: `reverse-memory-evaluator.ts`, `oddity-evaluator.ts`, etc. Each implements `PuzzleEvaluator`: `evaluate(instance, interaction)` → `EvaluationResult`. **Add a new evaluator here and register it.**

- **Engine** — `src/services/puzzles/engine/`  
  - `puzzle-factory.ts` — Builds `PuzzleInstance` from definition + data.  
  - `seeded-random.ts` — Seeded RNG (Mulberry32) for deterministic puzzles.  
  - `difficulty-controller.ts` — Maps round/difficulty/streak to params (sequence length, grid size, reveal duration, action time limit).  
  - `streak-speed-controller.ts` — Speed multipliers from streak (e.g. every 5 streak = faster reveal/interference).  

- **Renderer** — `src/components/puzzles/puzzle-renderer.tsx`  
  Switches on `instance.definition.type` and renders the right component. **Add a new branch and import your puzzle component.**

- **Puzzle UI components** — `src/components/puzzles/`  
  `reverse-memory-puzzle.tsx`, `oddity-puzzle.tsx`, `timing-puzzle.tsx`, `rotation-puzzle.tsx`, `rule-switch-puzzle.tsx`. Each receives `data` and callbacks (`onTap`, `onRotate`, etc.). **Add a new component here and wire it in `puzzle-renderer.tsx`.**

**Adding a new puzzle type (checklist):**  
1. Add type to `PuzzleType` and data interfaces in `src/types/puzzle.ts`.  
2. Create generator in `src/services/puzzles/generators/` and evaluator in `src/services/puzzles/evaluators/`.  
3. Register both in `src/services/puzzles/puzzle-registry.ts`.  
4. Create component in `src/components/puzzles/` and add case in `src/components/puzzles/puzzle-renderer.tsx`.  

See **PUZZLES.md** for full puzzle architecture.

---

### State and data flow

- **`src/context/puzzle-context.tsx`** — Puzzle queue and session. Holds `currentPuzzle`, `nextPuzzle`, `sessionStats`, `lastResult`. Exposes `initialize()`, `submitInteraction()`, `loadNextPuzzle()`, `resetSession()`. Uses `PuzzleRegistry` to generate (currently **Reverse Memory** only in the feed) and evaluators to score. **Change feed difficulty or which puzzle type is used in `generateNextPuzzle()`.**

- **`src/context/multiplayer-context.tsx`** — Multiplayer state: connection, room, players, game progress, results. Uses `socket-service`. Exposes `createRoom`, `joinRoom`, `leaveRoom`, `updateProgress`, `startGame`, etc.

- **`src/context/splash-context.tsx`** — Splash visibility and note. `shouldShowSplash`, `splashNote`, `dismissSplash`. Uses `SplashNoteService` for the random note.

- **`src/hooks/usePuzzleFeed.ts`** — Composes `usePuzzle()` and adds feed behavior: `handleInteraction` (submit + auto-advance after delay), `skipToNext`, `isPuzzleCompleted`. Used by the main feed screen.

- **`src/hooks/useTutorial.ts`** — Tutorial show/skip/complete, persisted (e.g. AsyncStorage). Used by feed to show `TutorialOverlay` on first run.

- **`src/hooks/useSplash.ts`** — Thin wrapper over splash context.

---

### Multiplayer

- **`src/services/multiplayer/socket-service.ts`** — Socket.io client. Connects to backend (`BACKEND_URL`), handles create/join room, ready, settings, start, progress, result. **Change server URL here.**

- **`src/types/multiplayer.ts`** — `PlayerInfo`, `MultiplayerRoom`, `RoomSettings`, `GameProgress`, `GameResult`, `MessageType`, etc.

- **`src/utils/network.ts`** — Expo network helpers: `getLocalIpAddress()`, `isConnectedToNetwork()`, `getNetworkType()`.

Server setup: see **MULTIPLAYER_SETUP.md** and **server/** in the repo.

---

### Key components

- **`src/components/feedback-overlay.tsx`** — Success/failure overlay after a puzzle (e.g. particles, message).
- **`src/components/stats-display.tsx`** — Session stats (streak, success rate, etc.) and help button (reopen tutorial).
- **`src/components/tutorial-overlay.tsx`** — First-time tutorial steps.
- **`src/components/puzzle-card.tsx`** — Wrapper/card for a puzzle in the feed.
- **`src/components/shape-tile.tsx`** — Reusable shape tile for puzzles.
- **`src/components/success-particles.tsx`** / **`src/components/error-particles.tsx`** — Feedback animations.
- **`src/components/themed-text.tsx`** / **`src/components/themed-view.tsx`** — Theme-aware primitives.
- **`src/components/ui/`** — Shared UI (e.g. `collapsible`, `icon-symbol`).

---

### Constants and config

- **`src/constants/puzzles.ts`** — `PUZZLE_CONSTANTS`: prefetch count, transition delay, difficulty levels, animation durations, haptic levels, colors.
- **`src/constants/theme.ts`** — Theme-related constants.
- **`app.json`** — Expo app config (name, slug, bundle id, plugins, etc.).

---

### Splash and tutorial

- **`src/services/splash-note-service.ts`** — List of splash notes and `getRandomNote()` (avoids immediate repeat). **Edit copy or add notes here.**
- **`src/app/splash.tsx`** — Splash UI; receives `note` and `onDismiss` from context.
- Tutorial steps and flow live in **`src/components/tutorial-overlay.tsx`** and **`src/hooks/useTutorial.ts`**. See **TUTORIAL_FEATURE.md** for details.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS |
| `npm run android` | Run on Android |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check |
| `npx prettier --write "src/**/*.{ts,tsx}"` | Format |

---


## Repo layout

- **This folder (app)** — Expo/React Native app; gameplay, UI, multiplayer client.
- **server/** — Node.js + Express + Socket.io multiplayer server.
- **website/** — Landing page (React + Vite + Tailwind).

---

## License

MIT. Contributions welcome — open an issue or PR.
