/**
 * Reverse Memory Puzzle Generator
 * Creates puzzles where player taps items NOT in the original sequence
 */
import type {
    InteractionType,
    PuzzleDefinition,
    PuzzleGenerator,
    PuzzleType,
    ReverseMemoryConfig,
    ReverseMemoryPuzzleData,
} from '@/types/puzzle';
import { PuzzleDifficultyController } from '../engine/difficulty-controller';
import { SeededRandom, generateColorPalette } from '../engine/seeded-random';

// Import visual element type from shared types
type VisualElement = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'flash' | 'music' | 'diamond' | 'trophy';

export class ReverseMemoryGenerator implements PuzzleGenerator<ReverseMemoryConfig> {
  generateDefinition(seed: number, difficulty: number = 0.5, streakMilestone: number = 0): PuzzleDefinition {
    const random = new SeededRandom(seed);
    
    // Use round number from seed to calculate difficulty
    // This allows difficulty to scale naturally with progression
    const roundNumber = Math.floor(seed / 1000) % 100;
    const difficultyParams = PuzzleDifficultyController.calculateDifficulty(roundNumber, difficulty, streakMilestone);

    const config: ReverseMemoryConfig = {
      seed,
      difficulty,
      sequenceLength: difficultyParams.sequenceLength,
      gridSize: difficultyParams.gridSize,
      decoyCount: difficultyParams.decoyCount,
      revealDuration: difficultyParams.revealDuration,
      actionTimeLimit: difficultyParams.actionTimeLimit,
    };

    return {
      id: `reverse-memory-${seed}`,
      type: 'reverse-memory' as PuzzleType,
      seed,
      config,
      interactionType: 'tap' as InteractionType,
      expectedDuration: config.revealDuration + 5000, // reveal time + interaction time
    };
  }

  generateData(definition: PuzzleDefinition): ReverseMemoryPuzzleData {
    const config = definition.config as ReverseMemoryConfig;
    const random = new SeededRandom(definition.seed);

    // Generate color palette
    const colors = generateColorPalette(definition.seed, 5);
    
    // Available visual elements: mix of geometric shapes and Expo icons
    const visualElements: VisualElement[] = [
      'circle', 
      'square', 
      'triangle',
      'star',
      'heart',
      'flash',
      'music',
      'diamond',
      'trophy',
    ];

    // Generate the memory sequence (what player should remember)
    const sequence: ReverseMemoryPuzzleData['sequence'] = [];
    for (let i = 0; i < config.sequenceLength; i++) {
      sequence.push({
        id: i,
        shape: random.pick(visualElements),
        color: random.pick(colors),
      });
    }

    // Create a set of sequence identifiers for quick lookup
    const sequenceIds = new Set(
      sequence.map(item => `${item.shape}-${item.color}`)
    );

    // Generate decoys (items NOT in sequence)
    const decoys: Array<{ shape: VisualElement; color: string }> = [];
    let attempts = 0;
    const maxAttempts = 100;

    while (decoys.length < config.decoyCount && attempts < maxAttempts) {
      attempts++;
      const decoyShape = random.pick(visualElements);
      const decoyColor = random.pick(colors);
      const decoyId = `${decoyShape}-${decoyColor}`;

      // Ensure decoy is not in sequence
      if (!sequenceIds.has(decoyId)) {
        // Check if we already have this decoy
        const isDuplicate = decoys.some(
          d => d.shape === decoyShape && d.color === decoyColor
        );
        
        if (!isDuplicate) {
          decoys.push({ shape: decoyShape, color: decoyColor });
        }
      }
    }

    // Combine sequence items and decoys into grid
    const allGridItems: Array<{
      id: number;
      shape: VisualElement;
      color: string;
      isInSequence: boolean;
    }> = [];

    // Add sequence items
    sequence.forEach((item, index) => {
      allGridItems.push({
        id: index,
        shape: item.shape,
        color: item.color,
        isInSequence: true,
      });
    });

    // Add decoys
    decoys.forEach((decoy, index) => {
      allGridItems.push({
        id: config.sequenceLength + index,
        shape: decoy.shape,
        color: decoy.color,
        isInSequence: false,
      });
    });

    // Shuffle the grid items for interference phase
    const shuffledItems = random.shuffle(allGridItems);

    // Fill remaining grid spaces with random items if needed
    while (shuffledItems.length < config.gridSize) {
      const fillShape = random.pick(visualElements);
      const fillColor = random.pick(colors);
      shuffledItems.push({
        id: shuffledItems.length,
        shape: fillShape,
        color: fillColor,
        isInSequence: sequenceIds.has(`${fillShape}-${fillColor}`),
      });
    }

    return {
      sequence,
      allItems: shuffledItems.slice(0, config.gridSize),
      gridSize: config.gridSize,
      revealDuration: config.revealDuration,
      actionTimeLimit: config.actionTimeLimit,
    };
  }
}
