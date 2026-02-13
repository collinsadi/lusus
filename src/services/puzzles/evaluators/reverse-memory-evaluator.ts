/**
 * Reverse Memory Puzzle Evaluator
 * Validates that player tapped only items NOT in the original sequence
 */
import type {
  PuzzleInstance,
  UserInteraction,
  EvaluationResult,
  ReverseMemoryPuzzleData,
} from '@/types/puzzle';
import { BasePuzzleEvaluator } from '../engine/base-evaluator';

export class ReverseMemoryEvaluator extends BasePuzzleEvaluator {
  evaluate(instance: PuzzleInstance, interaction: UserInteraction): EvaluationResult {
    const data = instance.data as ReverseMemoryPuzzleData;
    const timeTaken = this.calculateTimeTaken(instance);

    // Get tapped item ID
    const tappedItemId = interaction.data.itemId;
    if (tappedItemId === undefined) {
      return {
        success: false,
        timeTaken,
        feedback: this.createFailureFeedback(),
      };
    }

    // Find the tapped item
    const tappedItem = data.allItems.find(item => item.id === tappedItemId);
    if (!tappedItem) {
      return {
        success: false,
        timeTaken,
        feedback: this.createFailureFeedback(),
      };
    }

    // SUCCESS: Player tapped a decoy (item NOT in sequence)
    // FAILURE: Player tapped an item that WAS in the sequence
    const isCorrect = !tappedItem.isInSequence;

    // Calculate accuracy based on whether correct item was tapped
    const accuracy = isCorrect ? 1 : 0;

    return {
      success: isCorrect,
      timeTaken,
      accuracy,
      feedback: isCorrect 
        ? this.createSuccessFeedback(timeTaken)
        : this.createMemoryFailureFeedback(),
    };
  }

  /**
   * Creates specialized failure feedback for memory puzzles
   */
  private createMemoryFailureFeedback() {
    return {
      type: 'failure' as const,
      message: 'That was in the sequence!',
      hapticIntensity: 'medium' as const,
      animation: 'shake' as const,
      colorBurst: ['#FF6B6B', '#FFA07A'],
    };
  }
}
