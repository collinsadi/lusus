/**
 * Oddity Puzzle Evaluator
 */
import type {
  PuzzleInstance,
  UserInteraction,
  EvaluationResult,
  OddityPuzzleData,
} from '@/types/puzzle';
import { BasePuzzleEvaluator } from '../engine/base-evaluator';

export class OddityEvaluator extends BasePuzzleEvaluator {
  evaluate(instance: PuzzleInstance, interaction: UserInteraction): EvaluationResult {
    const data = instance.data as OddityPuzzleData;
    const timeTaken = this.calculateTimeTaken(instance);

    // Check if tapped item is the anomaly
    const tappedItemId = interaction.data.itemId;
    if (tappedItemId === undefined) {
      return {
        success: false,
        timeTaken,
        feedback: this.createFailureFeedback(),
      };
    }

    const tappedItem = data.items.find((item) => item.id === tappedItemId);
    const isCorrect = tappedItem?.isAnomaly ?? false;

    return {
      success: isCorrect,
      timeTaken,
      accuracy: isCorrect ? 1 : 0,
      feedback: isCorrect ? this.createSuccessFeedback(timeTaken) : this.createFailureFeedback(),
    };
  }
}
