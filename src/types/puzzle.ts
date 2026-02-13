/**
 * Core puzzle type definitions for the Lusus puzzle engine.
 * All puzzles must implement these interfaces for consistency.
 */

export enum PuzzleType {
  ODDITY = 'oddity',
  TIMING = 'timing',
  ROTATION = 'rotation',
  RULE_SWITCH = 'rule-switch',
  REVERSE_MEMORY = 'reverse-memory',
}

export enum InteractionType {
  TAP = 'tap',
  DRAG = 'drag',
  ROTATE = 'rotate',
  TIMING = 'timing',
}

export enum PuzzleResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
}

/**
 * Base configuration for all puzzles
 */
export interface PuzzleConfig {
  seed: number;
  difficulty?: number; // 0-1 scale
  themeColors?: string[];
}

/**
 * Core puzzle definition interface
 */
export interface PuzzleDefinition {
  id: string;
  type: PuzzleType;
  seed: number;
  config: PuzzleConfig;
  interactionType: InteractionType;
  expectedDuration: number; // in milliseconds
}

/**
 * Oddity puzzle specific config
 */
export interface OddityConfig extends PuzzleConfig {
  gridSize: number; // 3x3, 4x4, etc.
  colorVariance: number;
  anomalyRule: 'color' | 'shape' | 'size' | 'rotation';
}

export interface OddityPuzzleData {
  items: Array<{
    id: number;
    shape: 'circle' | 'square' | 'triangle' | 'hexagon';
    color: string;
    size: number;
    rotation: number;
    isAnomaly: boolean;
  }>;
  gridSize: number;
}

/**
 * Timing puzzle specific config
 */
export interface TimingConfig extends PuzzleConfig {
  speed: number; // pixels per second
  toleranceWindow: number; // in pixels
  cycleDirection: 'horizontal' | 'vertical' | 'circular';
}

export interface TimingPuzzleData {
  speed: number;
  targetZone: {
    start: number;
    end: number;
  };
  cycleDirection: TimingConfig['cycleDirection'];
}

/**
 * Rotation puzzle specific config
 */
export interface RotationConfig extends PuzzleConfig {
  rotationOffset: number; // degrees
  snapTolerance: number; // degrees
  shape: 'triangle' | 'arrow' | 'polygon' | 'star';
}

export interface RotationPuzzleData {
  targetRotation: number; // degrees
  currentRotation: number; // degrees
  snapTolerance: number;
  shape: RotationConfig['shape'];
  shapeColor: string;
}

/**
 * Rule switch puzzle specific config
 */
export interface RuleSwitchConfig extends PuzzleConfig {
  switchTiming: number; // milliseconds when rule switches
  decoyDensity: number; // 0-1 scale
  initialRule: 'color' | 'shape';
}

export interface RuleSwitchPuzzleData {
  items: Array<{
    id: number;
    color: string;
    shape: 'circle' | 'square' | 'triangle';
  }>;
  currentRule: 'color' | 'shape';
  targetColor: string;
  targetShape: 'circle' | 'square' | 'triangle';
  switchTiming: number;
}

/**
 * Reverse Memory puzzle specific config
 */
export interface ReverseMemoryConfig extends PuzzleConfig {
  sequenceLength: number; // Number of shapes in memory sequence
  gridSize: number; // Total items in grid (e.g., 9 for 3x3)
  revealDuration: number; // milliseconds
  decoyCount: number; // Number of decoys not in sequence
}

export interface ReverseMemoryPuzzleData {
  sequence: Array<{
    id: number;
    shape: 'circle' | 'square' | 'triangle';
    color: string;
  }>;
  allItems: Array<{
    id: number;
    shape: 'circle' | 'square' | 'triangle';
    color: string;
    isInSequence: boolean;
  }>;
  gridSize: number;
  revealDuration: number;
}

/**
 * Union type for all puzzle-specific data
 */
export type PuzzleCoreData =
  | OddityPuzzleData
  | TimingPuzzleData
  | RotationPuzzleData
  | RuleSwitchPuzzleData
  | ReverseMemoryPuzzleData;

/**
 * Runtime puzzle instance
 */
export interface PuzzleInstance<T extends PuzzleCoreData = PuzzleCoreData> {
  definition: PuzzleDefinition;
  data: T;
  startTime: number;
  result: PuzzleResult;
  userInteractions: UserInteraction[];
}

/**
 * User interaction event
 */
export interface UserInteraction {
  timestamp: number;
  type: 'tap' | 'drag' | 'rotate';
  data: {
    x?: number;
    y?: number;
    itemId?: number;
    rotation?: number;
    [key: string]: unknown;
  };
}

/**
 * Evaluation result
 */
export interface EvaluationResult {
  success: boolean;
  timeTaken: number;
  accuracy?: number;
  feedback: FeedbackData;
}

/**
 * Feedback data for UI
 */
export interface FeedbackData {
  type: 'success' | 'failure';
  message?: string;
  hapticIntensity: 'light' | 'medium' | 'heavy';
  colorBurst?: string[];
  animation?: 'pulse' | 'shake' | 'burst' | 'dissolve';
}

/**
 * Puzzle generator interface
 */
export interface PuzzleGenerator<T extends PuzzleConfig = PuzzleConfig> {
  generateDefinition(seed: number, difficulty?: number): PuzzleDefinition;
  generateData(definition: PuzzleDefinition): PuzzleCoreData;
}

/**
 * Puzzle evaluator interface
 */
export interface PuzzleEvaluator {
  evaluate(instance: PuzzleInstance, interaction: UserInteraction): EvaluationResult;
}

/**
 * Session statistics
 */
export interface SessionStats {
  totalPuzzles: number;
  successCount: number;
  failureCount: number;
  currentStreak: number;
  averageTime: number;
  startTime: number;
}
