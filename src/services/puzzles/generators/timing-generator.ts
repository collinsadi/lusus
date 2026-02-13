/**
 * Timing Puzzle Generator
 * Creates puzzles where user must tap at the right moment
 */
import type {
  PuzzleDefinition,
  PuzzleGenerator,
  TimingConfig,
  TimingPuzzleData,
  PuzzleType,
  InteractionType,
} from '@/types/puzzle';
import { SeededRandom } from '../engine/seeded-random';

export class TimingGenerator implements PuzzleGenerator<TimingConfig> {
  generateDefinition(seed: number, difficulty: number = 0.5): PuzzleDefinition {
    const random = new SeededRandom(seed);

    // Difficulty affects speed and tolerance
    const speed = 100 + difficulty * 150; // 100-250 pixels per second
    const toleranceWindow = 50 - difficulty * 30; // 50-20 pixels

    const directions: TimingConfig['cycleDirection'][] = ['horizontal', 'vertical', 'circular'];
    const cycleDirection = random.pick(directions);

    const config: TimingConfig = {
      seed,
      difficulty,
      speed,
      toleranceWindow,
      cycleDirection,
    };

    return {
      id: `timing-${seed}`,
      type: 'timing' as PuzzleType,
      seed,
      config,
      interactionType: 'timing' as InteractionType,
      expectedDuration: 4000,
    };
  }

  generateData(definition: PuzzleDefinition): TimingPuzzleData {
    const config = definition.config as TimingConfig;
    const random = new SeededRandom(definition.seed);

    // Target zone is positioned randomly along the path
    const pathLength = config.cycleDirection === 'circular' ? 360 : 300;
    const targetStart = random.nextInt(0, pathLength - config.toleranceWindow);

    return {
      speed: config.speed,
      targetZone: {
        start: targetStart,
        end: targetStart + config.toleranceWindow,
      },
      cycleDirection: config.cycleDirection,
    };
  }
}
