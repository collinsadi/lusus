/**
 * Multiplayer Game Screen
 * Real-time competitive puzzle solving with isolated puzzle state
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMultiplayer } from '@/context/multiplayer-context';
import PuzzleRenderer from '@/components/puzzles/puzzle-renderer';
import FeedbackOverlay from '@/components/feedback-overlay';
import { PuzzleRegistry } from '@/services/puzzles/puzzle-registry';
import { PuzzleType, PuzzleResult } from '@/types/puzzle';
import type { UserInteraction, PuzzleInstance, EvaluationResult, SessionStats } from '@/types/puzzle';

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

  // Isolated multiplayer puzzle state (not using shared PuzzleProvider)
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

  const [timeRemaining, setTimeRemaining] = useState(4000); // Start with 4 seconds to match countdown
  const [countdown, setCountdown] = useState(4);
  const [showPlayers, setShowPlayers] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [gameActuallyStarted, setGameActuallyStarted] = useState(false);
  const puzzleInitialized = useRef(false);
  const progressUpdateQueue = useRef<SessionStats[]>([]);
  const lastProgressSentRef = useRef<number>(0);
  const progressUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPuzzleRef = useRef<PuzzleInstance | null>(null);
  const isEvaluatingRef = useRef(false);
  const hasShownResultsRef = useRef<string | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    currentPuzzleRef.current = currentPuzzle;
  }, [currentPuzzle]);

  useEffect(() => {
    isEvaluatingRef.current = isEvaluating;
  }, [isEvaluating]);

  // Generate puzzle for multiplayer (isolated from single-player context)
  const generateMultiplayerPuzzle = useCallback(
    (totalSolved: number, currentStreak: number, maxStreakMilestone: number): PuzzleInstance | null => {
      const baseDifficulty = Math.min(0.3 + (totalSolved * 0.03), 0.7);
      const streakTier = Math.floor(currentStreak / 5);
      const streakBonus = streakTier * 0.15;
      const difficulty = Math.min(baseDifficulty + streakBonus, 1.0);
      const seed = Date.now() + Math.random() * 1000000;
      // Force streakMilestone to 4+ for multiplayer to get 3-second timeout (10s - 4*2s = 2s, but min is 3s)
      return PuzzleRegistry.generatePuzzle(PuzzleType.REVERSE_MEMORY, seed, 0, difficulty, 4);
    },
    []
  );

  // Initialize multiplayer puzzles
  const initializeMultiplayerPuzzles = useCallback(() => {
    if (puzzleInitialized.current) return;
    
    console.log('Initializing multiplayer puzzles...');
    const firstPuzzle = generateMultiplayerPuzzle(0, 0, 0);
    const secondPuzzle = generateMultiplayerPuzzle(0, 0, 0);
    
    setCurrentPuzzle(firstPuzzle);
    currentPuzzleRef.current = firstPuzzle;
    setNextPuzzle(secondPuzzle);
    puzzleInitialized.current = true;
    console.log('Multiplayer puzzles initialized');
  }, [generateMultiplayerPuzzle]);

  // Submit interaction for multiplayer puzzle (fully async, non-blocking, stable callback)
  const submitMultiplayerInteraction = useCallback(
    (interaction: UserInteraction) => {
      const puzzle = currentPuzzleRef.current;
      const evaluating = isEvaluatingRef.current;
      
      // Block interactions if game has ended or not started
      if (!puzzle || evaluating || puzzle.result !== PuzzleResult.PENDING || !gameActuallyStarted || !gameInProgress || gameResult) {
        console.log('Interaction blocked:', { 
          hasPuzzle: !!puzzle, 
          isEvaluating: evaluating, 
          puzzleResult: puzzle?.result,
          gameStarted: gameActuallyStarted,
          gameInProgress: gameInProgress,
          gameEnded: !!gameResult
        });
        return;
      }

      console.log('Processing interaction...', {
        puzzleId: puzzle.definition.id,
        interactionType: interaction.type
      });
      setIsEvaluating(true);
      isEvaluatingRef.current = true;

      // Use setTimeout to make evaluation truly non-blocking
      setTimeout(() => {
        try {
          const isTimeout = interaction.data.itemId === -1;
          const evaluator = PuzzleRegistry.getEvaluator(puzzle.definition.type);
          
          if (!evaluator) {
            console.error('No evaluator found for puzzle type:', puzzle.definition.type);
            setIsEvaluating(false);
            isEvaluatingRef.current = false;
            return;
          }

          // Evaluate puzzle
          const result = evaluator.evaluate(puzzle, interaction);
          console.log('Evaluation result:', result.success ? 'SUCCESS' : 'FAILURE');
          
          setLastResult(result);

          const updatedPuzzle: PuzzleInstance = {
            ...puzzle,
            result: result.success ? PuzzleResult.SUCCESS : PuzzleResult.FAILURE,
            userInteractions: [...puzzle.userInteractions, interaction],
          };
          setCurrentPuzzle(updatedPuzzle);
          currentPuzzleRef.current = updatedPuzzle;

          // Update session stats
          setSessionStats((prev) => {
            if (isTimeout) {
              return {
                ...prev,
                currentStreak: 0,
              };
            }

            const newTotal = prev.totalPuzzles + 1;
            const newSuccess = prev.successCount + (result.success ? 1 : 0);
            const newFailure = prev.failureCount + (result.success ? 0 : 1);
            const newStreak = result.success ? prev.currentStreak + 1 : 0;
            
            const newStreakMilestone = Math.floor(newStreak / 5);
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

          console.log('Evaluation complete, resetting isEvaluating');
          setIsEvaluating(false);
          isEvaluatingRef.current = false;
        } catch (error) {
          console.error('Error evaluating puzzle:', error);
          setIsEvaluating(false);
          isEvaluatingRef.current = false;
        }
      }, 0);
    },
    [gameActuallyStarted, gameInProgress, gameResult]
  );

  // Load next multiplayer puzzle
  const loadNextMultiplayerPuzzle = useCallback(() => {
    if (!nextPuzzle) {
      console.warn('No next puzzle available!');
      return;
    }

    console.log('Loading next puzzle...', {
      nextPuzzleResult: nextPuzzle.result,
      currentStats: sessionStats
    });

    const newNextPuzzle = generateMultiplayerPuzzle(
      sessionStats.totalPuzzles + 1,
      sessionStats.currentStreak,
      sessionStats.maxStreakMilestone
    );

    // Ensure next puzzle is in pending state
    if (nextPuzzle.result !== PuzzleResult.PENDING) {
      console.warn('Next puzzle was not in pending state, resetting...');
      nextPuzzle.result = PuzzleResult.PENDING;
    }

    setCurrentPuzzle(nextPuzzle);
    currentPuzzleRef.current = nextPuzzle;
    setNextPuzzle(newNextPuzzle);
    setLastResult(null);
    setIsEvaluating(false);
    isEvaluatingRef.current = false;
    
    console.log('Next puzzle loaded successfully, ready for interaction');
  }, [nextPuzzle, sessionStats, generateMultiplayerPuzzle]);

  // Non-blocking progress update system with throttling
  const sendProgressUpdate = useCallback((stats: SessionStats) => {
    if (!localPlayer || !gameInProgress) return;
    
    // Update local progress immediately (no network dependency)
    const progress = {
      playerId: localPlayer.id,
      currentStreak: stats.currentStreak,
      totalPuzzles: stats.totalPuzzles,
      successCount: stats.successCount,
      failureCount: stats.failureCount,
      lastUpdateTime: Date.now(),
    };

    // Queue the update for background sending (non-blocking)
    progressUpdateQueue.current.push(stats);
    
    // Throttle network updates to every 500ms to avoid overwhelming the network
    const now = Date.now();
    if (now - lastProgressSentRef.current < 500) {
      // Too soon, will be sent by the next scheduled update
      return;
    }
    
    // Send immediately and schedule next batch
    lastProgressSentRef.current = now;
    
    // Use setTimeout to make this truly non-blocking
    setTimeout(() => {
      try {
        updateProgress(stats);
      } catch (error) {
        console.log('Progress update queued for retry:', error);
        // Keep in queue for retry, don't block game
      }
    }, 0);
  }, [localPlayer, gameInProgress, updateProgress]);

  // Background progress sender - runs independently every 1 second
  useEffect(() => {
    if (!gameInProgress) return;

    const interval = setInterval(() => {
      if (progressUpdateQueue.current.length > 0) {
        // Get the latest progress from queue
        const latestStats = progressUpdateQueue.current[progressUpdateQueue.current.length - 1];
        progressUpdateQueue.current = []; // Clear queue
        
        // Send in background (fire and forget)
        try {
          updateProgress(latestStats);
        } catch (error) {
          console.log('Background progress update failed, will retry:', error);
          // Don't block the game, will retry in next interval
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameInProgress, updateProgress]);

  // Initialize puzzles when game starts
  useEffect(() => {
    if (gameInProgress && !puzzleInitialized.current) {
      initializeMultiplayerPuzzles();
    }
  }, [gameInProgress, initializeMultiplayerPuzzles]);

  // Countdown before game starts
  useEffect(() => {
    if (gameInProgress && !gameActuallyStarted && gameStartTime && currentRoom?.settings) {
      setCountdown(4);
      // Initialize time remaining with full duration
      setTimeRemaining(currentRoom.settings.timeLimit * 1000);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setGameActuallyStarted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [gameInProgress, gameActuallyStarted, gameStartTime, currentRoom]);

  // Update time remaining and end game when timer hits 0
  useEffect(() => {
    if (!gameInProgress || !gameStartTime || !currentRoom?.settings || !gameActuallyStarted) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - gameStartTime - 4000; // Subtract 4 seconds for countdown
      const remaining = Math.max(0, currentRoom.settings!.timeLimit * 1000 - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        // Immediately stop the game locally for all players
        setGameActuallyStarted(false);
        setIsEvaluating(false);
        isEvaluatingRef.current = false;
        
        // Trigger timeout in multiplayer context (host will calculate and emit results)
        updateProgress({
          ...sessionStats,
          totalPuzzles: sessionStats.totalPuzzles,
          successCount: sessionStats.successCount,
          failureCount: sessionStats.failureCount,
          currentStreak: sessionStats.currentStreak,
          maxStreakMilestone: sessionStats.maxStreakMilestone,
          averageTime: sessionStats.averageTime,
          startTime: sessionStats.startTime,
          isTimeout: true, // Flag to indicate timeout
        } as any);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameInProgress, gameStartTime, currentRoom, gameActuallyStarted, sessionStats, updateProgress]);

  // Queue progress updates non-blocking (replaced synchronous update)
  useEffect(() => {
    if (gameInProgress && gameActuallyStarted) {
      // Use non-blocking queued update instead of direct update
      sendProgressUpdate(sessionStats);
    }
  }, [sessionStats, gameInProgress, gameActuallyStarted, sendProgressUpdate]);

  // Auto-advance to next puzzle after completion
  useEffect(() => {
    // Don't load next puzzle if game has ended
    if (lastResult && !isEvaluating && gameActuallyStarted && gameInProgress && !gameResult) {
      const timer = setTimeout(() => {
        loadNextMultiplayerPuzzle();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [lastResult, isEvaluating, gameActuallyStarted, gameInProgress, gameResult, loadNextMultiplayerPuzzle]);

  // Show results modal when game ends
  useEffect(() => {
    if (gameResult && gameResult.winnerId !== hasShownResultsRef.current) {
      console.log('Game ended, showing results modal');
      
      // Mark that we've shown results for this winner
      hasShownResultsRef.current = gameResult.winnerId;
      
      // Immediately stop the game
      setGameActuallyStarted(false);
      setIsEvaluating(false);
      isEvaluatingRef.current = false;
      
      // Clear any pending puzzle timers (use ref to avoid dependency)
      if (currentPuzzleRef.current) {
        currentPuzzleRef.current = { ...currentPuzzleRef.current, result: PuzzleResult.FAILURE };
      }
      
      // Show results modal
      setShowResults(true);
    }
  }, [gameResult, localPlayer]);

  // Reset game state when component unmounts
  useEffect(() => {
    return () => {
      console.log('Multiplayer game component unmounting, cleaning up...');
      setGameActuallyStarted(false);
      setCountdown(4);
      // Reset multiplayer puzzle state
      puzzleInitialized.current = false;
      setCurrentPuzzle(null);
      currentPuzzleRef.current = null;
      setNextPuzzle(null);
      setLastResult(null);
      setIsEvaluating(false);
      isEvaluatingRef.current = false;
      hasShownResultsRef.current = null;
      setSessionStats({
        totalPuzzles: 0,
        successCount: 0,
        failureCount: 0,
        currentStreak: 0,
        maxStreakMilestone: 0,
        averageTime: 0,
        startTime: Date.now(),
      });
      // Clear progress queue
      progressUpdateQueue.current = [];
      lastProgressSentRef.current = 0;
      if (progressUpdateTimerRef.current) {
        clearTimeout(progressUpdateTimerRef.current);
        progressUpdateTimerRef.current = null;
      }
    };
  }, []);

  const handleInteraction = useCallback((interaction: UserInteraction) => {
    // Block interactions if game has ended
    if (gameResult || !gameInProgress) {
      console.log('Interaction ignored - game has ended');
      return;
    }
    
    // Only allow interactions after countdown
    if (!gameActuallyStarted) {
      console.log('Interaction ignored - game not started yet');
      return;
    }
    
    // Double-check evaluation state to prevent race conditions
    if (isEvaluatingRef.current) {
      console.log('Interaction ignored - already evaluating');
      return;
    }
    
    const puzzle = currentPuzzleRef.current;
    if (!puzzle || puzzle.result !== PuzzleResult.PENDING) {
      console.log('Interaction ignored - no active puzzle or puzzle already completed');
      return;
    }
    
    console.log('handleInteraction: Forwarding to submitMultiplayerInteraction');
    submitMultiplayerInteraction(interaction);
  }, [submitMultiplayerInteraction, gameActuallyStarted, gameInProgress, gameResult]);

  const handleQuit = () => {
    console.log('Quitting multiplayer game...');
    setGameActuallyStarted(false);
    puzzleInitialized.current = false;
    setCurrentPuzzle(null);
    currentPuzzleRef.current = null;
    setNextPuzzle(null);
    setLastResult(null);
    setIsEvaluating(false);
    isEvaluatingRef.current = false;
    hasShownResultsRef.current = null;
    leaveRoom();
    router.replace('/(tabs)');
  };

  // Handle share result
  const handleShare = async () => {
    if (!gameResult || !localPlayer) return;
    
    try {
      const isWinner = gameResult.winnerId === localPlayer.id;
      const message = isWinner
        ? `🏆 I won a Lusus multiplayer match with a ${gameResult.finalStreak} streak! Can you beat that?`
        : `I played a Lusus multiplayer match! The winner got a ${gameResult.finalStreak} streak. Join me next time!`;

      await Share.share({ message });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Handle exit from results
  const handleExit = () => {
    setShowResults(false);
    hasShownResultsRef.current = null;
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
            {gameActuallyStarted ? `${Math.floor(timeRemaining / 1000)}s` : `${countdown}s`}
          </Text>
        </View>

        <View style={styles.targetContainer}>
          <Text style={styles.targetLabel}>Target</Text>
          <Text style={styles.targetValue}>
            {sessionStats.currentStreak}/{targetStreak}
          </Text>
        </View>

        <View style={styles.topRightButtons}>
          <TouchableOpacity
            style={styles.contactsButton}
            onPress={() => setShowPlayers(!showPlayers)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="account-group" size={24} color="#ffffff" />
            <View style={styles.playerCountBadge}>
              <Text style={styles.playerCountText}>{currentRoom.players.length}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quitButton}
            onPress={handleQuit}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
      </View>

      {/* Puzzle Area */}
      <View style={styles.puzzleArea}>
        <PuzzleRenderer
          key={currentPuzzle.definition.id}
          instance={currentPuzzle}
          onInteraction={handleInteraction}
          currentStreak={sessionStats.currentStreak}
          isPaused={!gameActuallyStarted || !gameInProgress || !!gameResult}
        />
      </View>

      {/* Player Stats Modal */}
      <Modal
        visible={showPlayers}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPlayers(false)}
      >
        <Pressable 
          style={styles.modalBackdrop}
          onPress={() => setShowPlayers(false)}
        >
          <Pressable 
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Players</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPlayers(false)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
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
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Results Modal */}
      <Modal
        visible={showResults && !!gameResult && !!localPlayer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        {showResults && gameResult && localPlayer ? (
          <View style={styles.resultsBackdrop}>
            <View style={styles.resultsContainer}>
              <ScrollView 
                style={styles.resultsScroll}
                contentContainerStyle={styles.resultsScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Victory Card */}
                <LinearGradient
                  colors={
                    gameResult.winnerId === localPlayer.id
                      ? ['#6366f1', '#8b5cf6', '#d946ef']
                      : ['#1a1a2e', '#2d2d44']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.victoryCard}
                >
                  {gameResult.winnerId === localPlayer.id && (
                    <View style={styles.confettiContainer}>
                      <Text style={styles.confetti}>🎉</Text>
                      <Text style={styles.confetti}>🎊</Text>
                      <Text style={styles.confetti}>✨</Text>
                      <Text style={styles.confetti}>🏆</Text>
                    </View>
                  )}

                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>
                      {gameResult.winnerId === localPlayer.id ? 'Victory!' : 'Game Over'}
                    </Text>
                    {gameResult.winnerId === localPlayer.id && (
                      <MaterialCommunityIcons name="trophy" size={40} color="#fbbf24" />
                    )}
                  </View>

                  <View style={styles.winnerSection}>
                    <Text style={styles.winnerEmoji}>{gameResult.winnerEmoji}</Text>
                    <Text style={styles.winnerName}>{gameResult.winnerUsername}</Text>
                    <View style={styles.winnerStats}>
                      <View style={styles.statItem}>
                        <MaterialCommunityIcons name="fire" size={24} color="#ffffff" />
                        <Text style={styles.statValue}>{gameResult.finalStreak}</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <MaterialCommunityIcons name="timer" size={24} color="#ffffff" />
                        <Text style={styles.statValue}>
                          {(gameResult.completionTime / 1000).toFixed(1)}s
                        </Text>
                        <Text style={styles.statLabel}>Time</Text>
                      </View>
                    </View>
                  </View>

                  {gameResult.winnerId === localPlayer.id && (
                    <View style={styles.winnerBadge}>
                      <MaterialCommunityIcons name="crown" size={20} color="#fbbf24" />
                      <Text style={styles.winnerBadgeText}>Champion</Text>
                    </View>
                  )}
                </LinearGradient>

                {/* Leaderboard */}
                <View style={styles.leaderboardSection}>
                  <Text style={styles.sectionTitle}>Final Standings</Text>
                  
                  {[...gameResult.allPlayers]
                    .sort((a, b) => b.finalStreak - a.finalStreak)
                    .map((player, index) => {
                      const isLocal = player.playerId === localPlayer.id;
                      
                      return (
                        <View
                          key={player.playerId}
                          style={[
                            styles.leaderboardRow,
                            isLocal && styles.leaderboardRowActive,
                            index === 0 && styles.leaderboardRowFirst,
                          ]}
                        >
                          <View style={styles.rankContainer}>
                            {index === 0 && (
                              <MaterialCommunityIcons name="trophy" size={24} color="#fbbf24" />
                            )}
                            {index === 1 && (
                              <MaterialCommunityIcons name="medal" size={24} color="#c0c0c0" />
                            )}
                            {index === 2 && (
                              <MaterialCommunityIcons name="medal" size={24} color="#cd7f32" />
                            )}
                            {index > 2 && (
                              <Text style={styles.rankText}>{index + 1}</Text>
                            )}
                          </View>
                          
                          <Text style={styles.leaderboardEmoji}>{player.emoji}</Text>
                          
                          <View style={styles.leaderboardInfo}>
                            <Text style={styles.leaderboardName} numberOfLines={1}>
                              {player.username}
                              {isLocal && ' (You)'}
                            </Text>
                            <View style={styles.leaderboardStatsRow}>
                              <MaterialCommunityIcons name="fire" size={16} color="#6366f1" />
                              <Text style={styles.leaderboardStreak}>{player.finalStreak}</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                </View>
              </ScrollView>

              {/* Bottom Actions */}
              <View style={styles.resultsActions}>
                <TouchableOpacity
                  style={styles.resultActionButton}
                  onPress={handleShare}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="share-variant" size={24} color="#ffffff" />
                  <Text style={styles.resultActionText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resultActionButton, styles.exitButton]}
                  onPress={handleExit}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="home" size={24} color="#ffffff" />
                  <Text style={styles.resultActionText}>Exit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.resultsBackdrop}>
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>Loading results...</Text>
            </View>
          </View>
        )}
      </Modal>

      {/* Countdown Overlay */}
      {gameInProgress && !gameActuallyStarted && countdown > 0 && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>{countdown}</Text>
          <Text style={styles.countdownLabel}>Get Ready!</Text>
        </View>
      )}

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
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    position: 'relative',
  },
  playerCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#6366f1',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  playerCountText: {
    fontSize: 10,
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
    marginTop: 20,
    marginBottom: 80, // More space from bottom to avoid buttons
    paddingBottom: 40, // Additional padding to push content up
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalScrollContent: {
    gap: 12,
  },
  playerStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
    borderRadius: 12,
    padding: 12,
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
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 16,
  },
  countdownLabel: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  // Results Modal Styles
  resultsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    width: '90%',
    height: '85%',
    backgroundColor: '#0a0a0f',
    borderRadius: 20,
    overflow: 'hidden',
  },
  resultsScroll: {
    flex: 1,
    maxHeight: '100%',
  },
  resultsScrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  victoryCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
  },
  confetti: {
    fontSize: 32,
    opacity: 0.3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  cardTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  winnerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  winnerEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  winnerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  winnerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  winnerBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginLeft: 8,
  },
  leaderboardSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  leaderboardRowActive: {
    borderColor: '#6366f1',
  },
  leaderboardRowFirst: {
    backgroundColor: '#2d2d44',
    borderColor: '#fbbf24',
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
  leaderboardEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  leaderboardStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardStreak: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 4,
  },
  resultsActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
    backgroundColor: '#0a0a0f',
  },
  resultActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  exitButton: {
    backgroundColor: '#1a1a2e',
  },
  resultActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
