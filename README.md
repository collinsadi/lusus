# Lusus - Micro Puzzles Feed

An infinite vertical feed of ultra-short interactive puzzles built with Expo, React Native, and TypeScript.

**🎮 NEW: Multiplayer Mode!** Compete with friends in real-time puzzle battles! See [MULTIPLAYER.md](./MULTIPLAYER.md) for full documentation.

## Overview

Lusus is a mobile-first puzzle game featuring an infinite stream of micro-puzzles that take 3-8 seconds to solve. Each puzzle requires a single primary interaction (tap, drag, rotate, or timing) with immediate visual and haptic feedback.

**Experience Flow:**
```
scroll → solve → feedback → scroll → repeat
```

## Features

### Core Experience
- **First-Time Tutorial**: Interactive step-by-step guide for new players (can be replayed anytime)
- **Custom Splash Screen**: Playful entry experience with random motivational notes
- **Reverse Memory Gameplay**: Fast-paced cognitive challenge testing working memory
- **Progressive Difficulty**: Smooth scaling with relief rounds to prevent fatigue
- **5 Puzzle Types**: Reverse memory (primary), oddity detection, timing alignment, spatial rotation, and rule switching
- **Instant Feedback**: Visual animations + haptic responses
- **Session Statistics**: Track streaks, success rate, and progress
- **Deterministic Generation**: Seeded puzzles for reproducibility and sharing

### Multiplayer Features
- **Real-Time Competition**: Compete with friends via TCP sockets
- **Room System**: Create or join rooms with unique codes
- **Customizable Games**: Set target streaks (5-50) and time limits (30-600s)
- **Live Leaderboards**: See player rankings update in real-time
- **Victory Cards**: Shareable results cards for winners
- **Local Network Play**: Peer-to-peer gaming on the same Wi-Fi
- See [MULTIPLAYER.md](./MULTIPLAYER.md) and [MULTIPLAYER_SETUP.md](./MULTIPLAYER_SETUP.md) for complete documentation

### Technical Highlights
- **Scalable Architecture**: Easy to add new puzzle types
- **Performance Optimized**: 60fps animations, view recycling, lazy loading
- **Type-Safe**: Full TypeScript with strict typing
- **Modern UI/UX**: React Native Reanimated for smooth animations
- **Haptic Feedback**: Native haptic integration via Expo Haptics

## Getting Started

### Prerequisites
- Node.js 18+ 
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Project Structure

```
lusus/
├── src/
│   ├── types/              # TypeScript definitions
│   ├── services/
│   │   └── puzzles/        # Puzzle engine, generators, evaluators
│   ├── components/
│   │   ├── puzzles/        # Puzzle renderers
│   │   └── ...             # UI components
│   ├── context/            # React context for state
│   ├── hooks/              # Custom React hooks
│   └── app/                # Expo Router screens
├── PUZZLES.md              # Detailed puzzle architecture docs
└── README.md
```

## Puzzle Types

### 1. **Reverse Memory** (Primary)
Remember a sequence of shapes, then tap items that were NOT in the original sequence.
- **Interaction**: Tap decoy items (not in sequence)
- **Game Flow**: Reveal → Interference → Action → Evaluation
- **Features**: 
  - Adaptive difficulty progression
  - Relief rounds every 5th puzzle
  - Seeded for replay/sharing
  - Smooth animations between phases
- **Difficulty Scaling**:
  - Sequence length: 2-6 items
  - Grid size: 6-16 items
  - Reveal time: 3000-1500ms
  - Decoy complexity increases

### 2. **Oddity Detection**
Find the one different item in a grid of shapes.
- **Interaction**: Tap the anomaly
- **Variations**: Color, shape, size, or rotation differences

### 3. **Timing Alignment**
Tap when a moving indicator crosses the target zone.
- **Interaction**: Tap at the right moment
- **Variations**: Horizontal, vertical, or circular paths

### 4. **Spatial Rotation**
Rotate a shape to match the outline.
- **Interaction**: Drag-rotate gesture
- **Variations**: Different shapes with varying tolerances

### 5. **Rule Switch**
Tap items matching a rule (color or shape) that switches mid-puzzle.
- **Interaction**: Tap correct target
- **Variations**: Different switch timings and decoy densities

## Architecture

### Splash Screen System
The app features a custom in-app splash screen with:

**Components:**
- `SplashNoteService`: Manages a collection of playful, brain-themed motivational notes
- `useSplash`: Hook for splash state management (shown/dismissed)
- `SplashContext`: Global state provider for splash visibility
- `SplashScreen`: Animated component with random note + play button

**Features:**
- Random note selection per session (avoids immediate repeats)
- Smooth entrance animations (fade, scale, floating)
- Haptic feedback on button press
- Lightweight state tracking (`hasSeenSplash`)
- Easy to extend with seasonal themes or onboarding

**Usage in Testing:**
```typescript
const { resetSplash } = useSplashContext();
// Call resetSplash() to show splash again
```

### Tutorial System
First-time users are guided through the game mechanics with an interactive tutorial:

**Components:**
- `TutorialOverlay`: 6-step interactive tutorial component with animations
- `useTutorial`: Hook for managing tutorial state with AsyncStorage persistence
- Help icon in stats display for replaying the tutorial

**Features:**
- Shows automatically on first play (after initialization)
- Explains the core rule: find what's NOT in the sequence before time runs out
- Skip functionality available at any time
- Can be replayed via help button (?)
- State persisted across app sessions
- Beautiful animations and haptic feedback
- Progress indicator showing current step

**Tutorial Steps:**
1. Welcome to Lusus
2. Step 1: Memorize shapes
3. Step 2: Find the new one (not in sequence)
4. Step 3: Beat the timer
5. Build your streak
6. Ready to play

**Usage:**
```typescript
const { shouldShowTutorial, completeTutorial, skipTutorial, resetTutorial } = useTutorial();

// Reset tutorial for testing
await resetTutorial();
```

For detailed documentation, see [TUTORIAL_FEATURE.md](./TUTORIAL_FEATURE.md).

### Puzzle Engine
The system is built on a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         Puzzle Registry                 │
│  (Central hub for all puzzle types)     │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐      ┌───────────────┐
│  Generators   │      │  Evaluators   │
│  (Create)     │      │  (Judge)      │
└───────────────┘      └───────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
        ┌───────────────────────┐
        │   Puzzle Instance     │
        │   (Definition + Data) │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   Puzzle Renderer     │
        │   (Visual Component)  │
        └───────────────────────┘
```

### Key Components

**PuzzleRegistry**
- Central hub managing all puzzle types
- Maps types to generators and evaluators
- Provides puzzle instantiation

**Generators**
- Implement `PuzzleGenerator` interface
- Generate puzzle definitions from seeds
- Create deterministic puzzle data

**Evaluators**
- Extend `BasePuzzleEvaluator`
- Judge user interactions
- Return success/failure with feedback data

**Renderers**
- React Native components
- Render puzzle UI
- Handle user interactions

**PuzzleContext**
- Manages puzzle queue
- Tracks session statistics
- Handles state transitions

### Seeded Generation

All puzzles use a deterministic random number generator (Mulberry32):
```typescript
const puzzle = PuzzleRegistry.generatePuzzle(type, baseSeed, index);
// Same seed + index = same puzzle every time
```

This enables:
- Reproducible puzzles
- Puzzle sharing via seed
- Consistent difficulty progression

## Performance

### Optimizations
- **Memoized Components**: Prevent unnecessary re-renders
- **FlatList Recycling**: Efficient view recycling for infinite scroll
- **Lazy Instantiation**: Puzzles generated on-demand
- **Prefetching**: Next puzzle preloaded for smooth transitions

### Animation Performance
- React Native Reanimated for 60fps animations
- Worklet-based animations (runs on UI thread)
- Spring physics for natural motion

## Adding New Puzzles

See [PUZZLES.md](./PUZZLES.md) for detailed instructions on adding new puzzle types.

Quick overview:
1. Define types in `src/types/puzzle.ts`
2. Create generator in `src/services/puzzles/generators/`
3. Create evaluator in `src/services/puzzles/evaluators/`
4. Create renderer in `src/components/puzzles/`
5. Register in `puzzle-registry.ts` and `puzzle-renderer.tsx`

## Technologies

- **Expo** - React Native framework
- **TypeScript** - Type safety
- **React Native Reanimated** - 60fps animations
- **React Native Gesture Handler** - Touch interactions
- **Expo Haptics** - Haptic feedback
- **Expo Router** - File-based routing

## Development

```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Format code
npx prettier --write "src/**/*.{ts,tsx}"
```

## Future Enhancements

- ✅ **Difficulty Progression**: Implemented with smooth scaling and relief rounds
- **Daily Challenges**: Curated puzzles with leaderboards
- **Puzzle Sharing**: Share specific puzzles via seed (infrastructure ready)
- **Theme Packs**: Alternate shape sets and color schemes
- **Multiplayer**: Race mode using challenge seeds
- **Achievements**: Unlock system for milestones
- **Sound Design**: Audio feedback and music
- **Analytics**: Performance tracking and difficulty tuning

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Built with ❤️ for puzzle enthusiasts**
