/**
 * Rule Switch Puzzle Generator
 * Creates puzzles where the target rule switches mid-game
 */
import type {
  PuzzleDefinition,
  PuzzleGenerator,
  RuleSwitchConfig,
  RuleSwitchPuzzleData,
  PuzzleType,
  InteractionType,
} from '@/types/puzzle';
import { SeededRandom, generateColorPalette } from '../engine/seeded-random';

export class RuleSwitchGenerator implements PuzzleGenerator<RuleSwitchConfig> {
  generateDefinition(seed: number, difficulty: number = 0.5, streakMilestone: number = 0): PuzzleDefinition {
    const random = new SeededRandom(seed);

    // Difficulty affects switch timing and decoy density
    const switchTiming = 2000 - difficulty * 1000; // 2000-1000ms
    const decoyDensity = 0.3 + difficulty * 0.4; // 0.3-0.7

    const initialRule = random.pick(['color', 'shape'] as RuleSwitchConfig['initialRule'][]);

    const config: RuleSwitchConfig = {
      seed,
      difficulty,
      switchTiming,
      decoyDensity,
      initialRule,
    };

    return {
      id: `rule-switch-${seed}`,
      type: 'rule-switch' as PuzzleType,
      seed,
      config,
      interactionType: 'tap' as InteractionType,
      expectedDuration: 3000 + switchTiming,
    };
  }

  generateData(definition: PuzzleDefinition): RuleSwitchPuzzleData {
    const config = definition.config as RuleSwitchConfig;
    const random = new SeededRandom(definition.seed);

    const shapes: RuleSwitchPuzzleData['items'][0]['shape'][] = ['circle', 'square', 'triangle'];
    const colors = generateColorPalette(definition.seed, 3);

    const targetShape = random.pick(shapes);
    const targetColor = random.pick(colors);

    // Generate items
    const itemCount = 6 + Math.floor(config.decoyDensity * 6); // 6-12 items
    const items: RuleSwitchPuzzleData['items'] = [];

    // Ensure at least one correct item exists for each rule
    items.push({
      id: 0,
      color: targetColor,
      shape: targetShape,
    });

    // Generate remaining items with mix of decoys
    for (let i = 1; i < itemCount; i++) {
      const useTargetColor = random.next() > config.decoyDensity;
      const useTargetShape = random.next() > config.decoyDensity;

      items.push({
        id: i,
        color: useTargetColor ? targetColor : random.pick(colors.filter((c) => c !== targetColor)),
        shape: useTargetShape ? targetShape : random.pick(shapes.filter((s) => s !== targetShape)),
      });
    }

    // Shuffle items
    const shuffledItems = random.shuffle(items);

    return {
      items: shuffledItems,
      currentRule: config.initialRule,
      targetColor,
      targetShape,
      switchTiming: config.switchTiming,
    };
  }
}
