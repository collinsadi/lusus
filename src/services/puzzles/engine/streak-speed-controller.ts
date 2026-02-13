/**
 * Streak Speed Controller
 * Manages dynamic speed scaling based on player success streak
 * 
 * Every 5 consecutive successful rounds increases game speed.
 * Speed affects reveal duration, interference timing, and animation pacing.
 */

export interface SpeedMultipliers {
  reveal: number;        // Applied to reveal duration
  interference: number;  // Applied to interference transition
  animation: number;     // Applied to animation durations
}

export class StreakSpeedController {
  private static readonly STREAK_THRESHOLD = 5;
  private static readonly BASE_SPEED_INCREASE = 0.1; // 10% speed increase per tier
  private static readonly MAX_SPEED_MULTIPLIER = 0.4; // Cap at 40% reduction (2.5x faster)
  
  /**
   * Calculates speed multipliers based on current streak
   * 
   * @param streak - Current consecutive success streak
   * @returns Speed multipliers for different timing aspects
   */
  static getSpeedMultipliers(streak: number): SpeedMultipliers {
    // Calculate tier (0, 1, 2, 3, ...)
    const tier = Math.floor(streak / this.STREAK_THRESHOLD);
    
    // Calculate speed reduction (capped)
    const speedReduction = Math.min(
      tier * this.BASE_SPEED_INCREASE,
      this.MAX_SPEED_MULTIPLIER
    );
    
    // Speed multiplier: 1.0 = normal, 0.6 = fastest (40% reduction)
    const baseMultiplier = 1.0 - speedReduction;
    
    return {
      reveal: baseMultiplier,
      interference: baseMultiplier,
      animation: Math.max(baseMultiplier, 0.7), // Animations never go below 70% speed for UX
    };
  }
  
  /**
   * Applies speed multiplier to a duration value
   * 
   * @param baseDuration - Base duration in milliseconds
   * @param multiplier - Speed multiplier (e.g., 0.8 = 20% faster)
   * @returns Adjusted duration in milliseconds
   */
  static applySpeedMultiplier(baseDuration: number, multiplier: number): number {
    return Math.floor(baseDuration * multiplier);
  }
  
  /**
   * Gets the current speed tier based on streak
   * 
   * @param streak - Current consecutive success streak
   * @returns Speed tier (0 = normal, 1+ = increased speed)
   */
  static getSpeedTier(streak: number): number {
    return Math.floor(streak / this.STREAK_THRESHOLD);
  }
  
  /**
   * Calculates progress toward next speed tier
   * 
   * @param streak - Current consecutive success streak
   * @returns Progress value between 0 and 1
   */
  static getTierProgress(streak: number): number {
    const remainder = streak % this.STREAK_THRESHOLD;
    return remainder / this.STREAK_THRESHOLD;
  }
  
  /**
   * Checks if streak has reached a new speed tier
   * 
   * @param previousStreak - Previous streak value
   * @param currentStreak - Current streak value
   * @returns True if a new tier was reached
   */
  static hasReachedNewTier(previousStreak: number, currentStreak: number): boolean {
    return this.getSpeedTier(currentStreak) > this.getSpeedTier(previousStreak);
  }
  
  /**
   * Gets a descriptive label for current speed level
   * 
   * @param streak - Current consecutive success streak
   * @returns Human-readable speed label
   */
  static getSpeedLabel(streak: number): string {
    const tier = this.getSpeedTier(streak);
    
    if (tier === 0) return 'Normal';
    if (tier === 1) return 'Fast';
    if (tier === 2) return 'Very Fast';
    if (tier === 3) return 'Blazing';
    return 'Maximum';
  }
  
  /**
   * Validates that speed multipliers are within safe bounds
   * 
   * @param multipliers - Speed multipliers to validate
   * @returns True if all multipliers are valid
   */
  static validateMultipliers(multipliers: SpeedMultipliers): boolean {
    const { reveal, interference, animation } = multipliers;
    
    // All multipliers must be between 0.5 (2x speed) and 1.0 (normal)
    return (
      reveal >= 0.5 && reveal <= 1.0 &&
      interference >= 0.5 && interference <= 1.0 &&
      animation >= 0.5 && animation <= 1.0
    );
  }
}
