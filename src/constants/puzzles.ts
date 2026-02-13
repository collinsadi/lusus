/**
 * Puzzle Constants
 * Configuration values for puzzle system
 */

export const PUZZLE_CONSTANTS = {
  // Feed configuration
  PREFETCH_COUNT: 1,
  TRANSITION_DELAY: 1500, // ms
  
  // Difficulty levels
  DIFFICULTY: {
    EASY: 0.3,
    MEDIUM: 0.5,
    HARD: 0.7,
  },
  
  // Animation durations
  ANIMATION: {
    ENTRANCE: 300,
    FEEDBACK: 800,
    TRANSITION: 400,
  },
  
  // Haptic feedback
  HAPTIC: {
    LIGHT: 'light',
    MEDIUM: 'medium',
    HEAVY: 'heavy',
  },
  
  // Color palettes
  COLORS: {
    SUCCESS: ['#4CAF50', '#8BC34A', '#CDDC39'],
    FAILURE: ['#F44336', '#E91E63'],
    BACKGROUND: '#0a0a0f',
  },
} as const;

export default PUZZLE_CONSTANTS;
