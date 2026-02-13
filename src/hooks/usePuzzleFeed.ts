/**
 * Puzzle Feed Hook
 * Manages feed interaction and transitions
 */
import { useCallback, useRef } from 'react';
import { usePuzzle } from '@/context/puzzle-context';
import { PuzzleResult, type UserInteraction } from '@/types/puzzle';

export const usePuzzleFeed = () => {
  const {
    currentPuzzle,
    nextPuzzle,
    sessionStats,
    isEvaluating,
    lastResult,
    submitInteraction,
    loadNextPuzzle,
    resetSession,
  } = usePuzzle();

  const transitionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Handle user interaction
  const handleInteraction = useCallback(
    (interaction: UserInteraction) => {
      if (!currentPuzzle || currentPuzzle.result !== PuzzleResult.PENDING) {
        return;
      }

      submitInteraction(interaction);

      // Auto-transition after feedback delay
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = setTimeout(() => {
        loadNextPuzzle();
      }, 1500) as unknown as NodeJS.Timeout; // 1.5s delay for feedback animation
    },
    [currentPuzzle, submitInteraction, loadNextPuzzle]
  );

  // Manual transition to next puzzle
  const skipToNext = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    loadNextPuzzle();
  }, [loadNextPuzzle]);

  // Check if puzzle is completed
  const isPuzzleCompleted = currentPuzzle?.result !== PuzzleResult.PENDING;

  return {
    currentPuzzle,
    nextPuzzle,
    sessionStats,
    isEvaluating,
    lastResult,
    isPuzzleCompleted,
    handleInteraction,
    skipToNext,
    resetSession,
  };
};
