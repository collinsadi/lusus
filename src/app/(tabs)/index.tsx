/**
 * Lusus - Micro Puzzles Feed
 * Main feed screen with vertically swipeable puzzle stream
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions, FlatList, StyleSheet, View, ViewToken, TouchableOpacity } from 'react-native';
import {
    useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import FeedbackOverlay from '@/components/feedback-overlay';
import PuzzleRenderer from '@/components/puzzles/puzzle-renderer';
import StatsDisplay from '@/components/stats-display';
import TutorialOverlay from '@/components/tutorial-overlay';
import { usePuzzleFeed } from '@/hooks/usePuzzleFeed';
import { useTutorial } from '@/hooks/useTutorial';
import { usePuzzle } from '@/context/puzzle-context';
import { useSplashContext } from '@/context/splash-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PuzzleFeedScreen() {
  const {
    currentPuzzle,
    nextPuzzle,
    sessionStats,
    lastResult,
    isPuzzleCompleted,
    handleInteraction,
    skipToNext,
    resetSession,
  } = usePuzzleFeed();

  const { isInitialized, initialize } = usePuzzle();
  const { shouldShowTutorial, completeTutorial, skipTutorial, resetTutorial } = useTutorial();
  const { shouldShowSplash } = useSplashContext();
  const [showTutorialOverlay, setShowTutorialOverlay] = React.useState(false);

  const flatListRef = useRef<FlatList>(null);
  const scrollY = useSharedValue(0);
  const previousStatsRef = useRef(sessionStats);

  // Determine if we should show tutorial overlay
  useEffect(() => {
    // Show tutorial if: not initialized yet AND should show tutorial (first time) AND splash dismissed
    if (!isInitialized && shouldShowTutorial && !shouldShowSplash) {
      setShowTutorialOverlay(true);
    }
  }, [isInitialized, shouldShowTutorial, shouldShowSplash]);

  // Auto-initialize for returning users (who don't need tutorial)
  useEffect(() => {
    // Only initialize if: not initialized AND no tutorial needed AND splash dismissed
    if (!isInitialized && !shouldShowTutorial && !shouldShowSplash) {
      // User has already seen tutorial and splash is dismissed, initialize now
      initialize();
    }
  }, [isInitialized, shouldShowTutorial, shouldShowSplash, initialize]);

  // Handler to show tutorial again (for help button)
  const handleShowTutorial = useCallback(() => {
    setShowTutorialOverlay(true);
  }, []);

  // Handlers for tutorial completion (don't initialize again if already initialized)
  const handleTutorialComplete = useCallback(() => {
    setShowTutorialOverlay(false);
    completeTutorial();
  }, [completeTutorial]);

  const handleTutorialSkip = useCallback(() => {
    setShowTutorialOverlay(false);
    skipTutorial();
  }, [skipTutorial]);

  const handleTutorialInitialize = useCallback(() => {
    // Only initialize if not already initialized
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Create puzzle items for FlatList
  const puzzleItems = [currentPuzzle, nextPuzzle].filter(Boolean);

  // Scroll to top when session resets
  React.useEffect(() => {
    if (previousStatsRef.current.totalPuzzles > 0 && sessionStats.totalPuzzles === 0) {
      // Session was reset
      flatListRef.current?.scrollToIndex({ index: 0, animated: false });
      scrollY.value = 0;
    }
    previousStatsRef.current = sessionStats;
  }, [sessionStats, scrollY]);

  // Handle viewable items change (auto-scroll on completion)
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const viewableIndex = viewableItems[0].index || 0;
        scrollY.value = viewableIndex * SCREEN_HEIGHT;
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Auto-scroll to next puzzle after completion
  React.useEffect(() => {
    if (isPuzzleCompleted && lastResult) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 1, animated: true });
        setTimeout(skipToNext, 300);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isPuzzleCompleted, lastResult, skipToNext]);

  const renderPuzzle = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (!item) return null;

      return (
        <View style={styles.puzzleContainer}>
          <PuzzleRenderer 
            instance={item} 
            onInteraction={handleInteraction}
            currentStreak={sessionStats.currentStreak}
            isPaused={showTutorialOverlay || shouldShowSplash}
          />
        </View>
      );
    },
    [handleInteraction, sessionStats.currentStreak, showTutorialOverlay, shouldShowSplash]
  );

  const keyExtractor = useCallback((item: any, index: number) => {
    return item?.definition?.id ? `${item.definition.id}` : `loading-${index}`;
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <StatsDisplay 
          stats={sessionStats} 
          onReset={resetSession}
        />
      </View>

      <View style={styles.feedContainer}>
        <FlatList
          ref={flatListRef}
          data={puzzleItems}
          renderItem={renderPuzzle}
          keyExtractor={keyExtractor}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          scrollEnabled={isPuzzleCompleted && !showTutorialOverlay && !shouldShowSplash}
          snapToInterval={SCREEN_HEIGHT}
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(data, index) => ({
            length: SCREEN_HEIGHT,
            offset: SCREEN_HEIGHT * index,
            index,
          })}
          removeClippedSubviews={false}
          maxToRenderPerBatch={2}
          initialNumToRender={2}
          windowSize={3}
        />

        <FeedbackOverlay result={lastResult} />

        {/* Pause overlay when tutorial or splash is active */}
        {(showTutorialOverlay || shouldShowSplash) && (
          <View style={styles.pauseOverlay} pointerEvents="box-only" />
        )}
      </View>

      {/* Floating buttons at bottom */}
      {isInitialized && !showTutorialOverlay && !shouldShowSplash && (
        <>
          <TouchableOpacity 
            style={styles.multiplayerButton}
            onPress={() => router.push('/(tabs)/multiplayer')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="account-group" size={32} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={handleShowTutorial}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="help-circle" size={32} color="#ffffff" />
          </TouchableOpacity>
        </>
      )}

      {/* Tutorial overlay - shows for first-time users or when help button is clicked */}
      {showTutorialOverlay && (
        <TutorialOverlay 
          onComplete={handleTutorialComplete} 
          onSkip={handleTutorialSkip}
          onInitialize={handleTutorialInitialize}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  feedContainer: {
    flex: 1,
    position: 'relative',
  },
  puzzleContainer: {
    height: SCREEN_HEIGHT - 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  multiplayerButton: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1000,
  },
  helpButton: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1000,
  },
});
