/**
 * Puzzle factory - creates puzzle instances from definitions
 */
import type {
  PuzzleDefinition,
  PuzzleInstance,
  PuzzleResult,
  PuzzleCoreData,
} from '@/types/puzzle';

let instanceCounter = 0;

export class PuzzleFactory {
  /**
   * Creates a new puzzle instance from a definition and generated data
   */
  static createInstance<T extends PuzzleCoreData>(
    definition: PuzzleDefinition,
    data: T
  ): PuzzleInstance<T> {
    instanceCounter++;
    return {
      definition: {
        ...definition,
        id: `${definition.id}-${instanceCounter}`,
      },
      data,
      startTime: Date.now(),
      result: 'pending' as PuzzleResult,
      userInteractions: [],
    };
  }

  /**
   * Clones a puzzle instance with updated properties
   */
  static cloneInstance<T extends PuzzleCoreData>(
    instance: PuzzleInstance<T>,
    updates: Partial<PuzzleInstance<T>>
  ): PuzzleInstance<T> {
    return {
      ...instance,
      ...updates,
      userInteractions: updates.userInteractions
        ? [...updates.userInteractions]
        : [...instance.userInteractions],
    };
  }

  /**
   * Records a user interaction on a puzzle instance
   */
  static recordInteraction<T extends PuzzleCoreData>(
    instance: PuzzleInstance<T>,
    interaction: PuzzleInstance<T>['userInteractions'][0]
  ): PuzzleInstance<T> {
    return {
      ...instance,
      userInteractions: [...instance.userInteractions, interaction],
    };
  }

  /**
   * Marks a puzzle as completed with a result
   */
  static completeInstance<T extends PuzzleCoreData>(
    instance: PuzzleInstance<T>,
    result: PuzzleResult
  ): PuzzleInstance<T> {
    return {
      ...instance,
      result,
    };
  }
}
