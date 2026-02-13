# Lusus - Micro Puzzles Feed

An infinite vertical feed of ultra-short interactive puzzles built with Expo, React Native, and TypeScript.

**🎮 NEW: Multiplayer Mode!** Compete with friends in real-time puzzle battles! See [MULTIPLAYER.md](./MULTIPLAYER.md) for full documentation.

## Overview

Lusus is a mobile-first puzzle game featuring an infinite stream of cognitive micro-puzzles designed to challenge your memory, pattern recognition, and visual processing skills. Each puzzle is a fast-paced mental challenge with immediate visual and haptic feedback.

**How It Works:**
- Start with a **10-second timer** per puzzle
- Build your **streak** by solving puzzles correctly
- Every **5-streak milestone** reduces your timer by 2 seconds (minimum 3 seconds)
- The timer **never increases**, even if you break your streak!
- Puzzles get progressively harder as you improve
- Swipe to skip any puzzle and get a new one

**Experience Flow:**
```
memorize → identify → tap → feedback → repeat
```

## Features

### Core Experience
- **First-Time Tutorial**: Interactive step-by-step guide for new players (can be replayed anytime)
- **Custom Splash Screen**: Playful entry experience with random motivational notes
- **Reverse Memory Gameplay**: Fast-paced cognitive challenge testing working memory
- **Progressive Timer System**: Start at 10s, reduce by 2s every 5-streak milestone (minimum 3s)
- **Multiple Puzzle Types**: Reverse Memory (primary), Oddity Detection, with more coming soon
- **Adaptive Difficulty**: Puzzles automatically scale based on your performance
- **Instant Feedback**: Visual animations + haptic responses for every interaction
- **Session Statistics**: Track streaks, success rate, and progress in real-time
- **Streak Rewards**: Reach a 100-streak to unlock a unique shareable card!
- **Deterministic Generation**: Seeded puzzles for reproducibility and sharing

### Multiplayer Features
- **Real-Time Competition**: Compete with friends via TCP sockets
- **Room System**: Create or join rooms with unique codes
- **Customizable Games**: Set target streaks (5-50) and overall time limits (30-600s)
- **Live Progress**: See all players' streaks update in real-time
- **Game End Conditions**: Win by reaching target streak first OR having highest streak when time runs out
- **Victory Leaderboard**: Modal displays final standings with winner highlighted
- **Shareable Results**: Share your victory or performance with friends
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

## Gameplay Mechanics

### Timer & Progression
The game features a unique timer system designed to increase challenge as you improve:

- **Starting Timer**: 10 seconds per puzzle
- **Streak Milestones**: Every 5 correct answers in a row
- **Timer Reduction**: -2 seconds per milestone reached
- **Minimum Timer**: 3 seconds (never goes lower)
- **Important**: Timer never increases, even if you break your streak

**Example Progression:**
- Streak 0-4: 10 seconds
- Streak 5-9: 8 seconds
- Streak 10-14: 6 seconds
- Streak 15-19: 4 seconds
- Streak 20+: 3 seconds (minimum maintained)

### Scoring & Rewards
Earn points for correct answers based on:
- **Accuracy**: Get it right on the first try
- **Difficulty Level**: Harder puzzles = more points
- **Streak Bonuses**: Build streaks for multiplier bonuses
- **Speed**: Faster solves contribute to higher scores

**Special Milestone:**
- 🎁 Reach a **100-streak** to unlock a unique shareable victory card!

### Gameplay Tips
- 🧠 **Pay attention** during the memorization phase
- 📈 **Difficulty adapts** to your performance automatically
- 👆 **Swipe to skip** any puzzle and get a new one
- ⏱️ **Plan ahead** - the timer gets progressively faster as you build streaks
- 🏆 **Focus on accuracy** over speed to build consistent streaks

## Puzzle Types

### 🧩 Reverse Memory (Primary)
**Objective:** Memorize the shapes shown, then tap a shape that was **NOT** in the list before the timer runs out.

**How to Play:**
1. **Memorize Phase**: Watch the shapes that appear
2. **Interference Phase**: See all shapes mixed together
3. **Action Phase**: Tap any shape that was NOT in the memorized list
4. Beat the timer to succeed!

**Key Features:**
- Tests your working memory and attention to detail
- Adaptive difficulty progression
- Seeded for replay/sharing
- Smooth animations between phases
- Progressive speed increases with streak milestones

**Difficulty Scaling:**
- Sequence length: 2-6 items
- Grid size: 6-16 items
- Reveal time: 3000-1500ms (gets faster with streaks)
- Decoy complexity increases

### 🔍 Find the Oddity
**Objective:** Spot the different shape among similar ones.

**How to Play:**
- Look at the grid of shapes
- Find the one that's different
- Tap it before time runs out!

**Key Features:**
- Challenges your visual discrimination
- Tests attention to detail
- Variations in color, shape, or size

### 🎯 More Coming Soon
New puzzle types are in development and will be added regularly to keep your brain engaged!

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

### Frontend (Mobile App)
- **Expo** - React Native framework
- **TypeScript** - Type safety
- **React Native Reanimated** - 60fps animations
- **React Native Gesture Handler** - Touch interactions
- **Expo Haptics** - Haptic feedback
- **Expo Router** - File-based routing
- **Socket.io Client** - Real-time multiplayer communication

### Backend (Multiplayer Server)
- **Node.js + Express** - Server framework
- **Socket.io** - WebSocket-based real-time communication
- **TypeScript** - Type-safe server code
- See [MULTIPLAYER_SETUP.md](./MULTIPLAYER_SETUP.md) for server setup

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

- ✅ **Difficulty Progression**: Implemented with adaptive scaling
- ✅ **Progressive Timer System**: Implemented with streak-based reduction
- ✅ **Multiplayer Mode**: Real-time competitive gameplay with rooms
- ✅ **100-Streak Milestone**: Shareable card reward system
- **Daily Challenges**: Curated puzzles with global leaderboards
- **Puzzle Sharing**: Share specific puzzles via seed (infrastructure ready)
- **More Puzzle Types**: Expanding beyond Reverse Memory and Oddity Detection
- **Theme Packs**: Alternate shape sets and color schemes
- **Achievements**: Extended unlock system for various milestones
- **Sound Design**: Audio feedback and background music
- **Analytics**: Performance tracking and difficulty tuning
- **Global Leaderboards**: Compare your best streaks worldwide

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

**Built with ❤️ for puzzle enthusiasts**
