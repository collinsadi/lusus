/**
 * Oddity Puzzle Generator
 * Creates puzzles where user must find the one different item in a grid
 */
import type {
  PuzzleDefinition,
  PuzzleGenerator,
  OddityConfig,
  OddityPuzzleData,
  PuzzleType,
  InteractionType,
} from '@/types/puzzle';
import { SeededRandom, generateColorPalette } from '../engine/seeded-random';

export class OddityGenerator implements PuzzleGenerator<OddityConfig> {
  generateDefinition(seed: number, difficulty: number = 0.5, streakMilestone: number = 0): PuzzleDefinition {
    const random = new SeededRandom(seed);

    // Difficulty affects grid size (3x3 to 5x5)
    const gridSize = Math.floor(3 + difficulty * 2);

    const anomalyRules: OddityConfig['anomalyRule'][] = ['color', 'shape', 'size', 'rotation'];
    const anomalyRule = random.pick(anomalyRules);

    const config: OddityConfig = {
      seed,
      difficulty,
      gridSize,
      colorVariance: 0.1 + difficulty * 0.2,
      anomalyRule,
    };

    return {
      id: `oddity-${seed}`,
      type: 'oddity' as PuzzleType,
      seed,
      config,
      interactionType: 'tap' as InteractionType,
      expectedDuration: 3000 + gridSize * 500,
    };
  }

  generateData(definition: PuzzleDefinition): OddityPuzzleData {
    const config = definition.config as OddityConfig;
    const random = new SeededRandom(definition.seed);
    const itemCount = config.gridSize * config.gridSize;

    const shapes: OddityPuzzleData['items'][0]['shape'][] = [
      'circle',
      'square',
      'triangle',
      'hexagon',
    ];
    const baseShape = random.pick(shapes);
    const baseColor = generateColorPalette(definition.seed, 1)[0];
    const baseSize = 60 + random.nextInt(-10, 10);
    const baseRotation = random.nextInt(0, 360);

    // Generate anomaly index
    const anomalyIndex = random.nextInt(0, itemCount);

    const items: OddityPuzzleData['items'] = [];

    for (let i = 0; i < itemCount; i++) {
      const isAnomaly = i === anomalyIndex;
      let item: OddityPuzzleData['items'][0];

      switch (config.anomalyRule) {
        case 'color':
          item = {
            id: i,
            shape: baseShape,
            color: isAnomaly ? generateColorPalette(definition.seed + 999, 1)[0] : baseColor,
            size: baseSize,
            rotation: baseRotation,
            isAnomaly,
          };
          break;

        case 'shape':
          item = {
            id: i,
            shape: isAnomaly ? random.pick(shapes.filter((s) => s !== baseShape)) : baseShape,
            color: baseColor,
            size: baseSize,
            rotation: baseRotation,
            isAnomaly,
          };
          break;

        case 'size':
          item = {
            id: i,
            shape: baseShape,
            color: baseColor,
            size: isAnomaly ? baseSize * 1.4 : baseSize,
            rotation: baseRotation,
            isAnomaly,
          };
          break;

        case 'rotation':
          item = {
            id: i,
            shape: baseShape,
            color: baseColor,
            size: baseSize,
            rotation: isAnomaly ? (baseRotation + 90) % 360 : baseRotation,
            isAnomaly,
          };
          break;
      }

      items.push(item);
    }

    return {
      items,
      gridSize: config.gridSize,
    };
  }
}
