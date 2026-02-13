/**
 * Timing Puzzle Evaluator
 */
import type {
  PuzzleInstance,
  UserInteraction,
  EvaluationResult,
  TimingPuzzleData,
} from '@/types/puzzle';
import { BasePuzzleEvaluator } from '../engine/base-evaluator';

export class TimingEvaluator extends BasePuzzleEvaluator {
  evaluate(instance: PuzzleInstance, interaction: UserInteraction): EvaluationResult {
    const data = instance.data as TimingPuzzleData;
    const timeTaken = this.calculateTimeTaken(instance);

    // Get indicator position at tap time
    const position = interaction.data.position as number | undefined;
    if (position === undefined) {
      return {
        success: false,
        timeTaken,
        feedback: this.createFailureFeedback(),
      };
    }

    // Check if position is within target zone
    const isInZone = position >= data.targetZone.start && position <= data.targetZone.end;

    // Calculate accuracy (distance from center of target zone)
    const targetCenter = (data.targetZone.start + data.targetZone.end) / 2;
    const distance = Math.abs(position - targetCenter);
    const maxDistance = (data.targetZone.end - data.targetZone.start) / 2;
    const accuracy = Math.max(0, 1 - distance / maxDistance);

    return {
      success: isInZone,
      timeTaken,
      accuracy,
      feedback: isInZone ? this.createSuccessFeedback(timeTaken) : this.createFailureFeedback(),
    };
  }
}
