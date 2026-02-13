# Lusus - Micro Puzzles Feed

A scalable, infinite-scroll puzzle feed built with Expo + React Native + TypeScript.

## Architecture Overview

### Core Principles

- **Deterministic Generation**: All puzzles are seeded for reproducibility
- **Modular Design**: Strict separation between engine, generators, evaluators, and renderers
- **Performance First**: Memoized components, lazy loading, recycling views
- **Extensible**: Easy to add new puzzle types with minimal coupling

## Directory Structure

```
src/
├── types/
│   └── puzzle.ts              # Core type definitions and interfaces
├── services/
│   └── puzzles/
│       ├── engine/            # Core puzzle engine
│       │   ├── seeded-random.ts
│       │   ├── puzzle-factory.ts
│       │   ├── base-evaluator.ts
│       │   └── difficulty-controller.ts
│       ├── generators/        # Puzzle generators
│       │   ├── reverse-memory-generator.ts
│       │   ├── oddity-generator.ts
│       │   ├── timing-generator.ts
│       │   ├── rotation-generator.ts
│       │   └── rule-switch-generator.ts
│       ├── evaluators/        # Puzzle evaluators
│       │   ├── reverse-memory-evaluator.ts
│       │   ├── oddity-evaluator.ts
│       │   ├── timing-evaluator.ts
│       │   ├── rotation-evaluator.ts
│       │   └── rule-switch-evaluator.ts
│       ├── puzzle-registry.ts  # Central puzzle registry
│       └── index.ts
├── components/
│   ├── puzzles/               # Puzzle renderers
│   │   ├── reverse-memory-puzzle.tsx
│   │   ├── oddity-puzzle.tsx
│   │   ├── timing-puzzle.tsx
│   │   ├── rotation-puzzle.tsx
│   │   ├── rule-switch-puzzle.tsx
│   │   ├── puzzle-renderer.tsx
│   │   └── index.ts
│   ├── shape-tile.tsx         # Reusable shape component
│   ├── feedback-overlay.tsx   # Visual feedback
│   ├── success-particles.tsx  # Particle effects
│   ├── stats-display.tsx      # Session statistics
│   └── puzzle-card.tsx        # Animated wrapper
├── context/
│   └── puzzle-context.tsx     # Puzzle state management
├── hooks/
│   └── usePuzzleFeed.ts       # Feed interaction hook
└── app/
    └── (tabs)/
        └── index.tsx          # Main feed screen

```

## Puzzle Types

### 1. Reverse Memory (Primary)
Remember a sequence of shapes, then tap items that were NOT in the original sequence.

**Parameters:**
- Sequence length (2-6 items)
- Grid size (6-16 items)
- Decoy count (2+ items)
- Reveal duration (1500-3000ms)

**Phases:**
1. Reveal: Shows memory sequence
2. Interference: Brief transition with full grid
3. Action: Player taps decoys (items NOT in sequence)
4. Evaluation: Immediate feedback

**Interaction:** Tap items NOT in the memorized sequence

**Features:**
- Seeded deterministic generation
- Smooth difficulty progression with relief rounds
- Fast-paced cognitive challenge
- Replayable puzzles via seed sharing

### 2. Oddity Detection
Find the one different item in a grid.

**Parameters:**
- Grid size (3x3 to 5x5)
- Anomaly rule (color, shape, size, rotation)

**Interaction:** Tap the anomaly

### 3. Timing Alignment
Tap when the moving indicator crosses the target zone.

**Parameters:**
- Speed (pixels per second)
- Tolerance window
- Cycle direction (horizontal, vertical, circular)

**Interaction:** Tap at the right moment

### 4. Spatial Rotation
Rotate a shape to match the outline.

**Parameters:**
- Target rotation angle
- Snap tolerance
- Shape type (triangle, arrow, polygon, star)

**Interaction:** Drag-rotate gesture

### 5. Rule Switch
Tap the correct target based on current rule (color or shape). Rule switches mid-puzzle.

**Parameters:**
- Switch timing (when rule flips)
- Decoy density
- Target color/shape

**Interaction:** Tap correct object based on active rule

## Adding New Puzzle Types

### 1. Define Types

Add to `src/types/puzzle.ts`:

```typescript
export enum PuzzleType {
  YOUR_PUZZLE = 'your-puzzle',
}

export interface YourPuzzleConfig extends PuzzleConfig {
  // Your config properties
}

export interface YourPuzzleData {
  // Your puzzle data structure
}
```

### 2. Create Generator

Create `src/services/puzzles/generators/your-puzzle-generator.ts`:

```typescript
export class YourPuzzleGenerator implements PuzzleGenerator<YourPuzzleConfig> {
  generateDefinition(seed: number, difficulty?: number): PuzzleDefinition {
    // Generate puzzle definition
  }

  generateData(definition: PuzzleDefinition): YourPuzzleData {
    // Generate puzzle data from definition
  }
}
```

### 3. Create Evaluator

Create `src/services/puzzles/evaluators/your-puzzle-evaluator.ts`:

```typescript
export class YourPuzzleEvaluator extends BasePuzzleEvaluator {
  evaluate(instance: PuzzleInstance, interaction: UserInteraction): EvaluationResult {
    // Evaluate user interaction
  }
}
```

### 4. Create Renderer

Create `src/components/puzzles/your-puzzle.tsx`:

```typescript
const YourPuzzle: React.FC<YourPuzzleProps> = ({ data, onInteraction }) => {
  // Render puzzle UI
};
```

### 5. Register

Add to `src/services/puzzles/puzzle-registry.ts`:

```typescript
this.generators.set('your-puzzle', new YourPuzzleGenerator());
this.evaluators.set('your-puzzle', new YourPuzzleEvaluator());
```

Add to `src/components/puzzles/puzzle-renderer.tsx`:

```typescript
case 'your-puzzle':
  return <YourPuzzle data={instance.data as YourPuzzleData} ... />;
```

## Key Features

### Deterministic Generation
- Seeded random number generator ensures reproducibility
- Same seed always generates same puzzle
- Enables sharing specific puzzles

### Performance Optimizations
- Memoized puzzle components
- FlatList with item recycling
- Lazy puzzle instantiation
- Prefetching next puzzle

### Smooth UX
- React Native Reanimated for 60fps animations
- Haptic feedback integration
- Immediate visual feedback
- Auto-transition after completion

### State Management
- Lightweight context-based state
- Session statistics tracking
- Puzzle queue management
- No heavy global state library

## Session Statistics

Tracked metrics:
- Total puzzles completed
- Success/failure counts
- Current streak
- Average completion time

## Future Enhancements

Potential additions:
- Difficulty progression
- Daily challenges
- Puzzle sharing via seed
- Theme packs
- Analytics integration
- Multiplayer races
- Achievement system
- Sound effects
