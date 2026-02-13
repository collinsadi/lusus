/**
 * Seeded random number generator using Mulberry32 algorithm
 * Ensures deterministic puzzle generation from seeds
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Returns a random number between 0 and 1
   */
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Returns a random float between min and max
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Returns a random boolean
   */
  nextBool(): boolean {
    return this.next() < 0.5;
  }

  /**
   * Shuffles an array in-place using Fisher-Yates algorithm
   */
  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Picks a random element from an array
   */
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }
}

/**
 * Generates a unique seed from a base seed and index
 */
export function generateSeed(baseSeed: number, index: number): number {
  return (baseSeed * 2654435761 + index) >>> 0;
}

/**
 * Generates a color from a seed
 */
export function seedToColor(seed: number): string {
  const random = new SeededRandom(seed);
  const h = random.nextInt(0, 360);
  const s = random.nextInt(60, 90);
  const l = random.nextInt(45, 65);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Generates a palette of harmonious colors
 */
export function generateColorPalette(seed: number, count: number): string[] {
  const random = new SeededRandom(seed);
  const baseHue = random.nextInt(0, 360);
  const colors: string[] = [];

  for (let i = 0; i < count; i++) {
    const hueOffset = (360 / count) * i;
    const h = (baseHue + hueOffset) % 360;
    const s = random.nextInt(65, 85);
    const l = random.nextInt(50, 70);
    colors.push(`hsl(${h}, ${s}%, ${l}%)`);
  }

  return colors;
}
