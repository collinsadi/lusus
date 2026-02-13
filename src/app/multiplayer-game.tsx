/**
 * Multiplayer Game Screen
 * Real-time competitive puzzle solving
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMultiplayer } from '@/context/multiplayer-context';
import { usePuzzle } from '@/context/puzzle-context';
import PuzzleRenderer from '@/components/puzzles/puzzle-renderer';
import FeedbackOverlay from '@/components/feedback-overlay';
import type { UserInteraction } from '@/types/puzzle';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MultiplayerGameScreen() {
  const {
    currentRoom,
    localPlayer,
    gameInProgress,
    gameStartTime,
    gameProgress,
    gameResult,
    updateProgress,
    leaveRoom,
  } = useMultiplayer();

  const {
    currentPuzzle,
    nextPuzzle,
    sessionStats,
    lastResult,
    isEvaluating,
    submitInteraction,
    loadNextPuzzle,
  } = usePuzzle();

  const [timeRemaining, setTimeRemaining] = useState(0);

  // Initialize puzzles
  useEffect(() => {
    const { initialize } = usePuzzle();
    initialize();
  }, []);

  // Update time remaining
  useEffect(() => {
    if (!gameInProgress || !gameStartTime || !currentRoom?.settings) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - gameStartTime;
      const remaining = Math.max(0, currentRoom.settings!.timeLimit * 1000 - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameInProgress, gameStartTime, currentRoom]);

  // Sync progress with multiplayer
  useEffect(() => {
    if (gameInProgress) {
      updateProgress(sessionStats);
    }
  }, [sessionStats, gameInProgress, updateProgress]);

  // Auto-advance to next puzzle after completion
  useEffect(() => {
    if (lastResult && !isEvaluating) {
      const timer = setTimeout(() => {
        loadNextPuzzle();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [lastResult, isEvaluating, loadNextPuzzle]);

  // Navigate to results when game ends
  useEffect(() => {
    if (gameResult) {
      router.replace('/multiplayer-results');
    }
  }, [gameResult]);

  const handleInteraction = useCallback((interaction: UserInteraction) => {
    submitInteraction(interaction);
  }, [submitInteraction]);

  const handleQuit = () => {
    leaveRoom();
    router.replace('/(tabs)');
  };

  if (!currentRoom || !localPlayer || !currentPuzzle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const targetStreak = currentRoom.settings?.targetStreak || 0;
  const progress = ((sessionStats.currentStreak / targetStreak) * 100);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar - Timer and Target */}
      <View style={styles.topBar}>
        <View style={styles.timerContainer}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#ffffff" />
          <Text style={styles.timerText}>
            {Math.floor(timeRemaining / 1000)}s
          </Text>
        </View>

        <View style={styles.targetContainer}>
          <Text style={styles.targetLabel}>Target</Text>
          <Text style={styles.targetValue}>
            {sessionStats.currentStreak}/{targetStreak}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.quitButton}
          onPress={handleQuit}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
      </View>

      {/* Puzzle Area */}
      <View style={styles.puzzleArea}>
        <PuzzleRenderer
          instance={currentPuzzle}
          onInteraction={handleInteraction}
          currentStreak={sessionStats.currentStreak}
          isPaused={false}
        />
      </View>

      {/* Player Stats Sidebar */}
      <View style={styles.playersSidebar}>
        {currentRoom.players
          .sort((a, b) => {
            const aProgress = gameProgress.get(a.id);
            const bProgress = gameProgress.get(b.id);
            return (bProgress?.currentStreak || 0) - (aProgress?.currentStreak || 0);
          })
          .map((player, index) => {
            const playerProgress = gameProgress.get(player.id);
            const isLocalPlayer = player.id === localPlayer.id;
            
            return (
              <View
                key={player.id}
                style={[
                  styles.playerStatCard,
                  isLocalPlayer && styles.playerStatCardActive,
                  index === 0 && styles.playerStatCardFirst,
                ]}
              >
                <View style={styles.playerStatRank}>
                  <Text style={styles.playerStatRankText}>{index + 1}</Text>
                </View>
                <Text style={styles.playerStatEmoji}>{player.emoji}</Text>
                <View style={styles.playerStatInfo}>
                  <Text style={styles.playerStatName} numberOfLines={1}>
                    {player.username}
                  </Text>
                  <Text style={styles.playerStatStreak}>
                    {playerProgress?.currentStreak || 0}
                  </Text>
                </View>
              </View>
            );
          })}
      </View>

      <FeedbackOverlay result={lastResult} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  targetContainer: {
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  targetValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  quitButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  puzzleArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  playersSidebar: {
    position: 'absolute',
    right: 8,
    top: 80,
    gap: 8,
  },
  playerStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 8,
    width: 140,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerStatCardActive: {
    borderColor: '#6366f1',
  },
  playerStatCardFirst: {
    borderColor: '#fbbf24',
  },
  playerStatRank: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    marginRight: 6,
  },
  playerStatRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  playerStatEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  playerStatInfo: {
    flex: 1,
  },
  playerStatName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  playerStatStreak: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
  },
});
