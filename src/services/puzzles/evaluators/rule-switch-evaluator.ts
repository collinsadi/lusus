/**
 * Rule Switch Puzzle Evaluator
 */
import type {
  PuzzleInstance,
  UserInteraction,
  EvaluationResult,
  RuleSwitchPuzzleData,
} from '@/types/puzzle';
import { BasePuzzleEvaluator } from '../engine/base-evaluator';

export class RuleSwitchEvaluator extends BasePuzzleEvaluator {
  evaluate(instance: PuzzleInstance, interaction: UserInteraction): EvaluationResult {
    const data = instance.data as RuleSwitchPuzzleData;
    const timeTaken = this.calculateTimeTaken(instance);

    const tappedItemId = interaction.data.itemId;
    if (tappedItemId === undefined) {
      return {
        success: false,
        timeTaken,
        feedback: this.createFailureFeedback(),
      };
    }

    const tappedItem = data.items.find((item) => item.id === tappedItemId);
    if (!tappedItem) {
      return {
        success: false,
        timeTaken,
        feedback: this.createFailureFeedback(),
      };
    }

    // Determine current rule based on elapsed time
    const hasRuleSwitched = timeTaken >= data.switchTiming;
    const currentRule = hasRuleSwitched
      ? data.currentRule === 'color'
        ? 'shape'
        : 'color'
      : data.currentRule;

    // Check if item matches current rule
    let isCorrect = false;
    if (currentRule === 'color') {
      isCorrect = tappedItem.color === data.targetColor;
    } else {
      isCorrect = tappedItem.shape === data.targetShape;
    }

    return {
      success: isCorrect,
      timeTaken,
      accuracy: isCorrect ? 1 : 0,
      feedback: isCorrect ? this.createSuccessFeedback(timeTaken) : this.createFailureFeedback(),
    };
  }
}
