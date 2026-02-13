/**
 * Lusus - Micro Puzzles Feed
 * Main feed screen with vertically swipeable puzzle stream
 */
import React, { useCallback, useRef } from 'react';
import { Dimensions, FlatList, StyleSheet, View, ViewToken } from 'react-native';
import {
    useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import FeedbackOverlay from '@/components/feedback-overlay';
import PuzzleRenderer from '@/components/puzzles/puzzle-renderer';
import StatsDisplay from '@/components/stats-display';
import { usePuzzleFeed } from '@/hooks/usePuzzleFeed';

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

  const flatListRef = useRef<FlatList>(null);
  const scrollY = useSharedValue(0);
  const previousStatsRef = useRef(sessionStats);

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
          <PuzzleRenderer instance={item} onInteraction={handleInteraction} />
        </View>
      );
    },
    [handleInteraction]
  );

  const keyExtractor = useCallback((item: any, index: number) => {
    return item?.definition?.id ? `${item.definition.id}` : `loading-${index}`;
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <StatsDisplay stats={sessionStats} onReset={resetSession} />
      </View>

      <View style={styles.feedContainer}>
        <FlatList
          ref={flatListRef}
          data={puzzleItems}
          renderItem={renderPuzzle}
          keyExtractor={keyExtractor}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          scrollEnabled={isPuzzleCompleted}
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
      </View>
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
});
