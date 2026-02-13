/**
 * Rotation Puzzle Evaluator
 */
import type {
  PuzzleInstance,
  UserInteraction,
  EvaluationResult,
  RotationPuzzleData,
} from '@/types/puzzle';
import { BasePuzzleEvaluator } from '../engine/base-evaluator';

export class RotationEvaluator extends BasePuzzleEvaluator {
  evaluate(instance: PuzzleInstance, interaction: UserInteraction): EvaluationResult {
    const data = instance.data as RotationPuzzleData;
    const timeTaken = this.calculateTimeTaken(instance);

    const userRotation = interaction.data.rotation as number | undefined;
    if (userRotation === undefined) {
      return {
        success: false,
        timeTaken,
        feedback: this.createFailureFeedback(),
      };
    }

    // Calculate angular difference
    const difference = this.angleDifference(userRotation, data.targetRotation);
    const isCorrect = difference <= data.snapTolerance;

    // Calculate accuracy (0-1 scale)
    const accuracy = Math.max(0, 1 - difference / 180);

    return {
      success: isCorrect,
      timeTaken,
      accuracy,
      feedback: isCorrect ? this.createSuccessFeedback(timeTaken) : this.createFailureFeedback(),
    };
  }
}
