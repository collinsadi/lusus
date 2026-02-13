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
  isInitialized: boolean;
  initialize: () => void;
  submitInteraction: (interaction: UserInteraction) => void;
  loadNextPuzzle: () => void;
  resetSession: () => void;
}

const PuzzleContext = createContext<PuzzleContextValue | undefined>(undefined);

interface PuzzleProviderProps {
  children: React.ReactNode;
}

export const PuzzleProvider: React.FC<PuzzleProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleInstance | null>(null);
  const [nextPuzzle, setNextPuzzle] = useState<PuzzleInstance | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastResult, setLastResult] = useState<EvaluationResult | null>(null);
  
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalPuzzles: 0,
    successCount: 0,
    failureCount: 0,
    currentStreak: 0,
    maxStreakMilestone: 0,
    averageTime: 0,
    startTime: Date.now(),
  });

  // Generate a fresh random puzzle
  const generateNextPuzzle = useCallback(
    (totalSolved: number, currentStreak: number, maxStreakMilestone: number): PuzzleInstance | null => {
      // Use ReverseMemory as primary puzzle type
      // Base difficulty increases gradually with total puzzles solved
      const baseDifficulty = Math.min(0.3 + (totalSolved * 0.03), 0.7);
      
      // Streak bonus: significantly increase difficulty every 5 streaks
      const streakTier = Math.floor(currentStreak / 5);
      const streakBonus = streakTier * 0.15; // 15% boost per 5-streak milestone
      
      // Combined difficulty (capped at 1.0)
      const difficulty = Math.min(baseDifficulty + streakBonus, 1.0);
      
      // Generate a unique seed for each puzzle using current timestamp
      const seed = Date.now() + Math.random() * 1000000;
      return PuzzleRegistry.generatePuzzle(PuzzleType.REVERSE_MEMORY, seed, 0, difficulty, maxStreakMilestone);
    },
    []
  );

  // Initialize puzzles manually (called after splash dismisses)
  const initialize = useCallback(() => {
    if (isInitialized) return;
    
    const firstPuzzle = generateNextPuzzle(0, 0, 0);
    const secondPuzzle = generateNextPuzzle(0, 0, 0);
    
    setCurrentPuzzle(firstPuzzle);
    setNextPuzzle(secondPuzzle);
    setIsInitialized(true);
  }, [isInitialized, generateNextPuzzle]);

  // Submit interaction and evaluate
  const submitInteraction = useCallback(
    (interaction: UserInteraction) => {
      if (!currentPuzzle || isEvaluating || currentPuzzle.result !== 'pending') {
        return;
      }

      setIsEvaluating(true);

      // Check if this is a timeout (no actual user interaction)
      // Timeout is indicated by itemId: -1
      const isTimeout = interaction.data.itemId === -1;

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
      // Only count as "Solved" if user actually attempted it (not a timeout)
      setSessionStats((prev) => {
        if (isTimeout) {
          // For timeouts: just reset streak, don't count as solved
          return {
            ...prev,
            currentStreak: 0,
          };
        }

        // Regular interaction: count as solved
        const newTotal = prev.totalPuzzles + 1;
        const newSuccess = prev.successCount + (result.success ? 1 : 0);
        const newFailure = prev.failureCount + (result.success ? 0 : 1);
        const newStreak = result.success ? prev.currentStreak + 1 : 0;
        
        // Calculate streak milestone (how many 5-streak milestones reached)
        const newStreakMilestone = Math.floor(newStreak / 5);
        // Update maxStreakMilestone only if new milestone is higher
        const newMaxStreakMilestone = Math.max(prev.maxStreakMilestone, newStreakMilestone);
        
        const totalTime = prev.averageTime * prev.totalPuzzles + result.timeTaken;
        const newAverage = totalTime / newTotal;

        return {
          totalPuzzles: newTotal,
          successCount: newSuccess,
          failureCount: newFailure,
          currentStreak: newStreak,
          maxStreakMilestone: newMaxStreakMilestone,
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

    // Generate a fresh puzzle based on current progress and streak
    const newNextPuzzle = generateNextPuzzle(
      sessionStats.totalPuzzles + 1,
      sessionStats.currentStreak,
      sessionStats.maxStreakMilestone
    );

    setCurrentPuzzle(nextPuzzle);
    setNextPuzzle(newNextPuzzle);
    setLastResult(null);
  }, [nextPuzzle, sessionStats.totalPuzzles, sessionStats.currentStreak, sessionStats.maxStreakMilestone, generateNextPuzzle]);

  // Reset session
  const resetSession = useCallback(() => {
    if (!isInitialized) return;
    
    setCurrentPuzzle(generateNextPuzzle(0, 0, 0));
    setNextPuzzle(generateNextPuzzle(0, 0, 0));
    setLastResult(null);
    setSessionStats({
      totalPuzzles: 0,
      successCount: 0,
      failureCount: 0,
      currentStreak: 0,
      maxStreakMilestone: 0,
      averageTime: 0,
      startTime: Date.now(),
    });
  }, [isInitialized, generateNextPuzzle]);

  const value: PuzzleContextValue = {
    currentPuzzle,
    nextPuzzle,
    sessionStats,
    isEvaluating,
    lastResult,
    isInitialized,
    initialize,
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
