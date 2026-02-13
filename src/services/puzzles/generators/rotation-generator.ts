/**
 * Rotation Puzzle Generator
 * Creates puzzles where user must rotate a shape to match an outline
 */
import type {
  PuzzleDefinition,
  PuzzleGenerator,
  RotationConfig,
  RotationPuzzleData,
  PuzzleType,
  InteractionType,
} from '@/types/puzzle';
import { SeededRandom, generateColorPalette } from '../engine/seeded-random';

export class RotationGenerator implements PuzzleGenerator<RotationConfig> {
  generateDefinition(seed: number, difficulty: number = 0.5): PuzzleDefinition {
    const random = new SeededRandom(seed);

    // Difficulty affects snap tolerance (easier = more forgiving)
    const snapTolerance = 15 - difficulty * 10; // 15-5 degrees

    const shapes: RotationConfig['shape'][] = ['triangle', 'arrow', 'polygon', 'star'];
    const shape = random.pick(shapes);

    // Random rotation offset
    const rotationOffset = random.nextInt(30, 330);

    const config: RotationConfig = {
      seed,
      difficulty,
      rotationOffset,
      snapTolerance,
      shape,
    };

    return {
      id: `rotation-${seed}`,
      type: 'rotation' as PuzzleType,
      seed,
      config,
      interactionType: 'rotate' as InteractionType,
      expectedDuration: 5000,
    };
  }

  generateData(definition: PuzzleDefinition): RotationPuzzleData {
    const config = definition.config as RotationConfig;
    const random = new SeededRandom(definition.seed);

    const targetRotation = config.rotationOffset;
    const currentRotation = 0;
    const shapeColor = generateColorPalette(definition.seed, 1)[0];

    return {
      targetRotation,
      currentRotation,
      snapTolerance: config.snapTolerance,
      shape: config.shape,
      shapeColor,
    };
  }
}
