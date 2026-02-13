/**
 * Tutorial Hook
 * Manages tutorial state and persistence
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_STORAGE_KEY = '@lusus_tutorial_completed';

export interface UseTutorialReturn {
  shouldShowTutorial: boolean;
  completeTutorial: () => Promise<void>;
  skipTutorial: () => Promise<void>;
  resetTutorial: () => Promise<void>; // For testing/debugging
}

export const useTutorial = (): UseTutorialReturn => {
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has completed tutorial on mount
  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
        setShouldShowTutorial(completed !== 'true');
      } catch (error) {
        console.error('Error checking tutorial status:', error);
        // On error, show tutorial to be safe
        setShouldShowTutorial(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkTutorialStatus();
  }, []);

  // Mark tutorial as completed
  const completeTutorial = useCallback(async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
      setShouldShowTutorial(false);
    } catch (error) {
      console.error('Error completing tutorial:', error);
    }
  }, []);

  // Skip tutorial (same as complete)
  const skipTutorial = useCallback(async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
      setShouldShowTutorial(false);
    } catch (error) {
      console.error('Error skipping tutorial:', error);
    }
  }, []);

  // Reset tutorial (for testing)
  const resetTutorial = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY);
      setShouldShowTutorial(true);
    } catch (error) {
      console.error('Error resetting tutorial:', error);
    }
  }, []);

  return {
    shouldShowTutorial: !isLoading && shouldShowTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  };
};
