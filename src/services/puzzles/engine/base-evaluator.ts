/**
 * Base puzzle evaluator with common evaluation logic
 */
import type {
  PuzzleInstance,
  UserInteraction,
  EvaluationResult,
  FeedbackData,
} from '@/types/puzzle';

export abstract class BasePuzzleEvaluator {
  /**
   * Evaluates a user interaction against the puzzle instance
   */
  abstract evaluate(instance: PuzzleInstance, interaction: UserInteraction): EvaluationResult;

  /**
   * Calculates time taken for the puzzle
   */
  protected calculateTimeTaken(instance: PuzzleInstance): number {
    return Date.now() - instance.startTime;
  }

  /**
   * Creates success feedback
   */
  protected createSuccessFeedback(timeTaken: number): FeedbackData {
    let hapticIntensity: FeedbackData['hapticIntensity'] = 'medium';
    let animation: FeedbackData['animation'] = 'pulse';

    // Faster completion = more intense feedback
    if (timeTaken < 2000) {
      hapticIntensity = 'heavy';
      animation = 'burst';
    } else if (timeTaken < 4000) {
      hapticIntensity = 'medium';
      animation = 'pulse';
    } else {
      hapticIntensity = 'light';
      animation = 'pulse';
    }

    return {
      type: 'success',
      hapticIntensity,
      animation,
      colorBurst: ['#4CAF50', '#8BC34A', '#CDDC39'],
    };
  }

  /**
   * Creates failure feedback
   */
  protected createFailureFeedback(): FeedbackData {
    return {
      type: 'failure',
      hapticIntensity: 'light',
      animation: 'shake',
      colorBurst: ['#F44336', '#E91E63'],
    };
  }

  /**
   * Checks if a tap hit a target area
   */
  protected isTapInBounds(
    tapX: number,
    tapY: number,
    targetX: number,
    targetY: number,
    targetWidth: number,
    targetHeight: number
  ): boolean {
    return (
      tapX >= targetX &&
      tapX <= targetX + targetWidth &&
      tapY >= targetY &&
      tapY <= targetY + targetHeight
    );
  }

  /**
   * Normalizes angle to 0-360 range
   */
  protected normalizeAngle(angle: number): number {
    let normalized = angle % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
  }

  /**
   * Calculates angular difference
   */
  protected angleDifference(angle1: number, angle2: number): number {
    const diff = Math.abs(this.normalizeAngle(angle1) - this.normalizeAngle(angle2));
    return Math.min(diff, 360 - diff);
  }
}
