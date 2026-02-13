/**
 * Puzzle Registry - Central hub for all puzzle types
 * Manages generators and evaluators
 */
import {
  PuzzleType,
  type PuzzleGenerator,
  type PuzzleEvaluator,
  type PuzzleDefinition,
  type PuzzleInstance,
  type PuzzleCoreData,
} from '@/types/puzzle';

import { OddityGenerator } from './generators/oddity-generator';
import { TimingGenerator } from './generators/timing-generator';
import { RotationGenerator } from './generators/rotation-generator';
import { RuleSwitchGenerator } from './generators/rule-switch-generator';
import { ReverseMemoryGenerator } from './generators/reverse-memory-generator';

import { OddityEvaluator } from './evaluators/oddity-evaluator';
import { TimingEvaluator } from './evaluators/timing-evaluator';
import { RotationEvaluator } from './evaluators/rotation-evaluator';
import { RuleSwitchEvaluator } from './evaluators/rule-switch-evaluator';
import { ReverseMemoryEvaluator } from './evaluators/reverse-memory-evaluator';

import { PuzzleFactory } from './engine/puzzle-factory';
import { generateSeed } from './engine/seeded-random';

class PuzzleRegistryClass {
  private generators: Map<PuzzleType, PuzzleGenerator>;
  private evaluators: Map<PuzzleType, PuzzleEvaluator>;

  constructor() {
    this.generators = new Map();
    this.evaluators = new Map();
    this.initializeRegistry();
  }

  private initializeRegistry() {
    // Register generators
    this.generators.set(PuzzleType.ODDITY, new OddityGenerator());
    this.generators.set(PuzzleType.TIMING, new TimingGenerator());
    this.generators.set(PuzzleType.ROTATION, new RotationGenerator());
    this.generators.set(PuzzleType.RULE_SWITCH, new RuleSwitchGenerator());
    this.generators.set(PuzzleType.REVERSE_MEMORY, new ReverseMemoryGenerator());

    // Register evaluators
    this.evaluators.set(PuzzleType.ODDITY, new OddityEvaluator());
    this.evaluators.set(PuzzleType.TIMING, new TimingEvaluator());
    this.evaluators.set(PuzzleType.ROTATION, new RotationEvaluator());
    this.evaluators.set(PuzzleType.RULE_SWITCH, new RuleSwitchEvaluator());
    this.evaluators.set(PuzzleType.REVERSE_MEMORY, new ReverseMemoryEvaluator());
  }

  /**
   * Gets a generator for a specific puzzle type
   */
  getGenerator(type: PuzzleType): PuzzleGenerator | undefined {
    return this.generators.get(type);
  }

  /**
   * Gets an evaluator for a specific puzzle type
   */
  getEvaluator(type: PuzzleType): PuzzleEvaluator | undefined {
    return this.evaluators.get(type);
  }

  /**
   * Generates a complete puzzle instance ready to render
   */
  generatePuzzle(type: PuzzleType, baseSeed: number, index: number, difficulty?: number, streakMilestone?: number): PuzzleInstance | null {
    const generator = this.getGenerator(type);
    if (!generator) {
      console.error(`No generator found for puzzle type: ${type}`);
      return null;
    }

    const seed = generateSeed(baseSeed, index);
    const definition = generator.generateDefinition(seed, difficulty, streakMilestone);
    const data = generator.generateData(definition);

    return PuzzleFactory.createInstance(definition, data);
  }

  /**
   * Generates a random puzzle from available types
   */
  generateRandomPuzzle(baseSeed: number, index: number, difficulty?: number): PuzzleInstance | null {
    const types: PuzzleType[] = Array.from(this.generators.keys());
    const seed = generateSeed(baseSeed, index);
    const randomIndex = seed % types.length;
    const type = types[randomIndex];

    return this.generatePuzzle(type, baseSeed, index, difficulty);
  }

  /**
   * Gets all available puzzle types
   */
  getAvailableTypes(): PuzzleType[] {
    return Array.from(this.generators.keys());
  }
}

// Export singleton instance
export const PuzzleRegistry = new PuzzleRegistryClass();
