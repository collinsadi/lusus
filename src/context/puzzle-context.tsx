/**
 * Puzzle Context
 * Manages puzzle state, queue, and session stats
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  PuzzleType,
  PuzzleResult,
  type PuzzleInstance,
  type UserInteraction,
  type EvaluationResult,
  type SessionStats,
} from '@/types/puzzle';
import { PuzzleRegistry } from '@/services/puzzles/puzzle-registry';

interface PuzzleContextValue {
  currentPuzzle: PuzzleInstance | null;
  nextPuzzle: PuzzleInstance | null;
  sessionStats: SessionStats;
  isEvaluating: boolean;
  lastResult: EvaluationResult | null;
  submitInteraction: (interaction: UserInteraction) => void;
  loadNextPuzzle: () => void;
  resetSession: () => void;
}

const PuzzleContext = createContext<PuzzleContextValue | undefined>(undefined);

interface PuzzleProviderProps {
  children: React.ReactNode;
}

export const PuzzleProvider: React.FC<PuzzleProviderProps> = ({ children }) => {
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleInstance | null>(null);
  const [nextPuzzle, setNextPuzzle] = useState<PuzzleInstance | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastResult, setLastResult] = useState<EvaluationResult | null>(null);
  
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalPuzzles: 0,
    successCount: 0,
    failureCount: 0,
    currentStreak: 0,
    averageTime: 0,
    startTime: Date.now(),
  });

  // Generate a fresh random puzzle
  const generateNextPuzzle = useCallback(
    (totalSolved: number): PuzzleInstance | null => {
      // Use ReverseMemory as primary puzzle type
      // Difficulty increases with total puzzles solved for progression
      const difficulty = Math.min(0.3 + (totalSolved * 0.05), 1.0);
      // Generate a unique seed for each puzzle using current timestamp
      const seed = Date.now() + Math.random() * 1000000;
      return PuzzleRegistry.generatePuzzle(PuzzleType.REVERSE_MEMORY, seed, 0, difficulty);
    },
    []
  );

  // Initialize puzzles on mount
  useEffect(() => {
    const firstPuzzle = generateNextPuzzle(0);
    const secondPuzzle = generateNextPuzzle(0);
    
    setCurrentPuzzle(firstPuzzle);
    setNextPuzzle(secondPuzzle);
  }, [generateNextPuzzle]);

  // Submit interaction and evaluate
  const submitInteraction = useCallback(
    (interaction: UserInteraction) => {
      if (!currentPuzzle || isEvaluating || currentPuzzle.result !== 'pending') {
        return;
      }

      setIsEvaluating(true);

      // Get evaluator for current puzzle type
      const evaluator = PuzzleRegistry.getEvaluator(currentPuzzle.definition.type);
      if (!evaluator) {
        console.error('No evaluator found for puzzle type:', currentPuzzle.definition.type);
        setIsEvaluating(false);
        return;
      }

      // Evaluate the interaction
      const result = evaluator.evaluate(currentPuzzle, interaction);
      setLastResult(result);

      // Update puzzle result
      const updatedPuzzle: PuzzleInstance = {
        ...currentPuzzle,
        result: result.success ? PuzzleResult.SUCCESS : PuzzleResult.FAILURE,
        userInteractions: [...currentPuzzle.userInteractions, interaction],
      };
      setCurrentPuzzle(updatedPuzzle);

      // Update session stats
      setSessionStats((prev) => {
        const newTotal = prev.totalPuzzles + 1;
        const newSuccess = prev.successCount + (result.success ? 1 : 0);
        const newFailure = prev.failureCount + (result.success ? 0 : 1);
        const newStreak = result.success ? prev.currentStreak + 1 : 0;
        
        const totalTime = prev.averageTime * prev.totalPuzzles + result.timeTaken;
        const newAverage = totalTime / newTotal;

        return {
          totalPuzzles: newTotal,
          successCount: newSuccess,
          failureCount: newFailure,
          currentStreak: newStreak,
          averageTime: newAverage,
          startTime: prev.startTime,
        };
      });

      setIsEvaluating(false);
    },
    [currentPuzzle, isEvaluating]
  );

  // Load next puzzle in queue
  const loadNextPuzzle = useCallback(() => {
    if (!nextPuzzle) return;

    // Generate a fresh puzzle based on current progress
    const newNextPuzzle = generateNextPuzzle(sessionStats.totalPuzzles + 1);

    setCurrentPuzzle(nextPuzzle);
    setNextPuzzle(newNextPuzzle);
    setLastResult(null);
  }, [nextPuzzle, sessionStats.totalPuzzles, generateNextPuzzle]);

  // Reset session
  const resetSession = useCallback(() => {
    setCurrentPuzzle(generateNextPuzzle(0));
    setNextPuzzle(generateNextPuzzle(0));
    setLastResult(null);
    setSessionStats({
      totalPuzzles: 0,
      successCount: 0,
      failureCount: 0,
      currentStreak: 0,
      averageTime: 0,
      startTime: Date.now(),
    });
  }, [generateNextPuzzle]);

  const value: PuzzleContextValue = {
    currentPuzzle,
    nextPuzzle,
    sessionStats,
    isEvaluating,
    lastResult,
    submitInteraction,
    loadNextPuzzle,
    resetSession,
  };

  return <PuzzleContext.Provider value={value}>{children}</PuzzleContext.Provider>;
};

export const usePuzzle = (): PuzzleContextValue => {
  const context = useContext(PuzzleContext);
  if (!context) {
    throw new Error('usePuzzle must be used within a PuzzleProvider');
  }
  return context;
};
