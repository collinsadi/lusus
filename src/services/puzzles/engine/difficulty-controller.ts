/**
 * Puzzle Difficulty Controller
 * Manages smooth difficulty progression with relief rounds
 */

export interface DifficultyParams {
  sequenceLength: number;
  gridSize: number;
  decoyCount: number;
  revealDuration: number; // in milliseconds
}

export class PuzzleDifficultyController {
  /**
   * Calculates difficulty parameters based on round number
   * Uses non-linear scaling with occasional relief rounds
   * 
   * @param round - Current round number (0-indexed)
   * @param baseDifficulty - Base difficulty multiplier (0-1)
   * @returns Difficulty parameters for the round
   */
  static calculateDifficulty(round: number, baseDifficulty: number = 0.5): DifficultyParams {
    // Check for relief round (every 5th round is easier)
    const isReliefRound = round > 0 && round % 5 === 0;
    
    if (isReliefRound) {
      // Relief round: reduce difficulty by 30%
      const reliefMultiplier = 0.7;
      const adjustedRound = Math.max(0, round - 2);
      return this.computeParams(adjustedRound, baseDifficulty * reliefMultiplier);
    }

    return this.computeParams(round, baseDifficulty);
  }

  /**
   * Computes actual difficulty parameters
   * Uses logarithmic scaling for smooth progression
   */
  private static computeParams(round: number, difficulty: number): DifficultyParams {
    // Logarithmic progression for smooth scaling
    const progressionFactor = Math.log(round + 2) / Math.log(2); // log2(round + 2)
    const scaledDifficulty = Math.min(difficulty * progressionFactor, 1);

    // Sequence length: 2-6 items
    const sequenceLength = Math.floor(2 + scaledDifficulty * 4);

    // Grid size: 6-16 items (2x3 to 4x4)
    const gridSizeOptions = [6, 9, 12, 16];
    const gridIndex = Math.min(Math.floor(scaledDifficulty * 4), 3);
    const gridSize = gridSizeOptions[gridIndex];

    // Decoy count: ensures at least 2 decoys, scales with grid
    const minDecoys = 2;
    const maxDecoys = Math.max(gridSize - sequenceLength, minDecoys);
    const decoyCount = Math.max(minDecoys, Math.floor(maxDecoys * (0.5 + scaledDifficulty * 0.5)));

    // Reveal duration: 3000ms to 1500ms (faster as difficulty increases)
    const maxRevealTime = 3000;
    const minRevealTime = 1500;
    const revealDuration = Math.floor(maxRevealTime - (scaledDifficulty * (maxRevealTime - minRevealTime)));

    return {
      sequenceLength: Math.min(sequenceLength, gridSize - 2), // Ensure room for decoys
      gridSize,
      decoyCount,
      revealDuration,
    };
  }

  /**
   * Gets grid dimensions from total grid size
   */
  static getGridDimensions(gridSize: number): { rows: number; cols: number } {
    const dimensionMap: Record<number, { rows: number; cols: number }> = {
      6: { rows: 2, cols: 3 },
      9: { rows: 3, cols: 3 },
      12: { rows: 3, cols: 4 },
      16: { rows: 4, cols: 4 },
    };

    return dimensionMap[gridSize] || { rows: 3, cols: 3 };
  }

  /**
   * Validates difficulty parameters
   */
  static validateParams(params: DifficultyParams): boolean {
    const { sequenceLength, gridSize, decoyCount } = params;
    
    // Must have at least 2 decoys
    if (decoyCount < 2) return false;
    
    // Sequence + decoys must not exceed grid
    if (sequenceLength + decoyCount > gridSize) return false;
    
    // Sequence must be reasonable
    if (sequenceLength < 1 || sequenceLength > gridSize - 2) return false;
    
    return true;
  }

  /**
   * Gets difficulty description for UI
   */
  static getDifficultyLabel(round: number): string {
    if (round < 3) return 'Easy';
    if (round < 6) return 'Medium';
    if (round < 10) return 'Hard';
    if (round < 15) return 'Expert';
    return 'Master';
  }
}
