/**
 * Splash Hook
 * Manages splash screen state and behavior
 */
import { useState, useEffect, useMemo } from 'react';
import { SplashNoteService, type SplashNote } from '@/services/splash-note-service';

export interface UseSplashReturn {
  shouldShowSplash: boolean;
  splashNote: SplashNote;
  dismissSplash: () => void;
  resetSplash: () => void;
}

export function useSplash(): UseSplashReturn {
  const [hasSeenSplash, setHasSeenSplash] = useState(false);
  
  // Memoize note selection - only compute once per mount
  const splashNote = useMemo(() => {
    return SplashNoteService.getRandomNote();
  }, []);

  const shouldShowSplash = !hasSeenSplash;

  const dismissSplash = () => {
    setHasSeenSplash(true);
  };

  const resetSplash = () => {
    setHasSeenSplash(false);
  };

  return {
    shouldShowSplash,
    splashNote,
    dismissSplash,
    resetSplash,
  };
}
