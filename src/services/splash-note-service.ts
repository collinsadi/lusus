/**
 * Splash Note Service
 * Manages cute, playful notes for the splash screen
 */

export interface SplashNote {
  id: string;
  text: string;
  emoji?: string;
}

const CUTE_NOTES: SplashNote[] = [
  { id: '1', text: 'Time to flex those brain muscles!', emoji: '💪' },
  { id: '2', text: 'Your neurons are ready to party!', emoji: '🎉' },
  { id: '3', text: 'Let\'s make some synapses sparkle!', emoji: '✨' },
  { id: '4', text: 'Ready for some mental gymnastics?', emoji: '🤸' },
  { id: '5', text: 'Your brain called. It wants a workout!', emoji: '🧠' },
  { id: '6', text: 'Time to puzzle and prosper!', emoji: '🚀' },
  { id: '7', text: 'Let\'s turn those gears!', emoji: '⚙️' },
  { id: '8', text: 'Brain mode: activated!', emoji: '🔥' },
  { id: '9', text: 'Ready to outsmart yourself?', emoji: '🎯' },
  { id: '10', text: 'Let\'s make thinking fun!', emoji: '🌈' },
  { id: '11', text: 'Your daily dose of brain candy!', emoji: '🍬' },
  { id: '12', text: 'Time to unlock new pathways!', emoji: '🔓' },
  { id: '13', text: 'Let\'s get those dendrites dancing!', emoji: '💃' },
  { id: '14', text: 'Ready for a cerebral adventure?', emoji: '🗺️' },
  { id: '15', text: 'Your brain\'s favorite playground!', emoji: '🎪' },
  { id: '16', text: 'Time to think outside the box!', emoji: '📦' },
  { id: '17', text: 'Let\'s play with patterns!', emoji: '🎨' },
  { id: '18', text: 'Your cognitive companion awaits!', emoji: '🤖' },
  { id: '19', text: 'Ready to challenge perception?', emoji: '👁️' },
  { id: '20', text: 'Let\'s make some neural magic!', emoji: '✨' },
];

export class SplashNoteService {
  private static lastNoteId: string | null = null;

  /**
   * Get a random cute note, avoiding repeats when possible
   */
  static getRandomNote(): SplashNote {
    const availableNotes = CUTE_NOTES.filter((note) => note.id !== this.lastNoteId);
    const pool = availableNotes.length > 0 ? availableNotes : CUTE_NOTES;
    
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selectedNote = pool[randomIndex];
    
    this.lastNoteId = selectedNote.id;
    return selectedNote;
  }

  /**
   * Get a deterministic note using a seed (for future use)
   */
  static getNoteWithSeed(seed: number): SplashNote {
    const index = seed % CUTE_NOTES.length;
    return CUTE_NOTES[index];
  }

  /**
   * Get all available notes
   */
  static getAllNotes(): SplashNote[] {
    return [...CUTE_NOTES];
  }

  /**
   * Get total count of notes
   */
  static getNotesCount(): number {
    return CUTE_NOTES.length;
  }
}
