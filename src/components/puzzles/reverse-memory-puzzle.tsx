/**
 * Reverse Memory Puzzle Renderer
 * Implements reveal -> interference -> player action game loop
 * With streak-based speed progression
 */
import { PuzzleDifficultyController } from '@/services/puzzles/engine/difficulty-controller';
import { StreakSpeedController } from '@/services/puzzles/engine/streak-speed-controller';
import type { ReverseMemoryPuzzleData } from '@/types/puzzle';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import ShapeTile from '../shape-tile';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 32;

type GamePhase = 'reveal' | 'interference' | 'action' | 'complete';

interface ReverseMemoryPuzzleProps {
  data: ReverseMemoryPuzzleData;
  onTap: (itemId: number) => void;
  currentStreak?: number; // Current success streak for speed scaling
  isPaused?: boolean; // Pause all timers and interactions
}

const ReverseMemoryPuzzle: React.FC<ReverseMemoryPuzzleProps> = ({ 
  data, 
  onTap, 
  currentStreak = 0,
  isPaused = false
}) => {
  const [phase, setPhase] = useState<GamePhase>('reveal');
  const [tappedItems, setTappedItems] = useState<Set<number>>(new Set());
  
  const fadeOpacity = useSharedValue(0);
  const instructionOpacity = useSharedValue(1);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseTimeRef = React.useRef<number>(0);
  const pauseStartRef = React.useRef<number>(0);

  // Calculate speed multipliers based on streak
  const speedMultipliers = useMemo(
    () => StreakSpeedController.getSpeedMultipliers(currentStreak),
    [currentStreak]
  );

  // Apply speed scaling to timings
  const scaledRevealDuration = useMemo(
    () => StreakSpeedController.applySpeedMultiplier(data.revealDuration, speedMultipliers.reveal),
    [data.revealDuration, speedMultipliers.reveal]
  );

  const scaledInterferenceDuration = useMemo(
    () => StreakSpeedController.applySpeedMultiplier(800, speedMultipliers.interference),
    [speedMultipliers.interference]
  );

  const scaledAnimationDuration = useMemo(
    () => StreakSpeedController.applySpeedMultiplier(300, speedMultipliers.animation),
    [speedMultipliers.animation]
  );

  const scaledActionTimeLimit = useMemo(
    () => StreakSpeedController.applySpeedMultiplier(data.actionTimeLimit, speedMultipliers.reveal),
    [data.actionTimeLimit, speedMultipliers.reveal]
  );

  const [timeRemaining, setTimeRemaining] = useState<number>(scaledActionTimeLimit);

  // Calculate grid dimensions
  const gridDimensions = useMemo(
    () => PuzzleDifficultyController.getGridDimensions(data.gridSize),
    [data.gridSize]
  );

  const availableWidth = SCREEN_WIDTH - GRID_PADDING * 2;
  const itemSize = Math.min(
    (availableWidth - (gridDimensions.cols - 1) * 12) / gridDimensions.cols,
    80
  );

  // Phase lifecycle management with speed scaling
  useEffect(() => {
    // Don't progress through phases while paused
    if (isPaused && phase !== 'action') {
      return;
    }
    
    fadeOpacity.value = withTiming(1, { duration: scaledAnimationDuration });
    
    // Phase 1: Reveal sequence (speed-scaled)
    if (phase === 'reveal') {
      const revealTimer = setTimeout(() => {
        setPhase('interference');
      }, scaledRevealDuration);

      return () => clearTimeout(revealTimer);
    }

    // Phase 2: Show interference grid (speed-scaled)
    if (phase === 'interference') {
      instructionOpacity.value = withTiming(0, { duration: scaledAnimationDuration });
      
      const interferenceTimer = setTimeout(() => {
        setPhase('action');
        // Reset time remaining when entering action phase
        setTimeRemaining(scaledActionTimeLimit);
      }, scaledInterferenceDuration);

      return () => clearTimeout(interferenceTimer);
    }

    // Phase 3: Action phase with countdown timer
    if (phase === 'action') {
      const startTime = Date.now();
      
      // Update timer every 100ms for smooth countdown
      const countdownInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, scaledActionTimeLimit - elapsed);
        setTimeRemaining(remaining);
        
        // Auto-fail when time runs out
        if (remaining <= 0) {
          clearInterval(countdownInterval);
          setPhase('complete');
          // Submit a timeout interaction (tap with invalid itemId)
          onTap(-1); // -1 indicates timeout failure
        }
      }, 100);

      timerRef.current = countdownInterval;

      return () => {
        clearInterval(countdownInterval);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [phase, isPaused, scaledRevealDuration, scaledInterferenceDuration, scaledAnimationDuration, fadeOpacity, instructionOpacity, scaledActionTimeLimit, onTap]);

  // Handle pause/resume for action phase timer
  useEffect(() => {
    if (phase !== 'action') return;

    if (isPaused) {
      // Store the current time remaining when paused
      pauseTimeRef.current = timeRemaining;
      pauseStartRef.current = Date.now();
      
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else if (pauseStartRef.current > 0) {
      // Resume: start new timer with remaining time
      const startTime = Date.now();
      const remainingAtPause = pauseTimeRef.current;
      
      const countdownInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, remainingAtPause - elapsed);
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          clearInterval(countdownInterval);
          setPhase('complete');
          onTap(-1);
        }
      }, 100);

      timerRef.current = countdownInterval;
      pauseStartRef.current = 0;

      return () => {
        clearInterval(countdownInterval);
      };
    }
  }, [isPaused, phase, onTap, timeRemaining]);

  // Handle tap
  const handleTap = useCallback(
    (itemId: number) => {
      if (phase !== 'action' || isPaused) return;
      
      // Prevent double-tap
      if (tappedItems.has(itemId)) return;

      // Clear countdown timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setTappedItems(prev => new Set(prev).add(itemId));
      
      // Submit interaction
      onTap(itemId);
      
      // Mark as complete after submission
      setPhase('complete');
    },
    [phase, isPaused, tappedItems, onTap]
  );

  // Animated instruction style
  const instructionStyle = useAnimatedStyle(() => ({
    opacity: instructionOpacity.value,
  }));

  // Render reveal phase (sequence only)
  const renderRevealPhase = () => {
    return (
      <View style={styles.phaseContainer}>
        <Animated.Text style={[styles.instructionText, instructionStyle]}>
          Remember these shapes
        </Animated.Text>
        
        <View style={styles.sequenceContainer}>
          {data.sequence.map((item, index) => (
            <View
              key={`sequence-${index}`}
              style={[
                styles.sequenceItem,
                { width: itemSize, height: itemSize },
              ]}
            >
              <ShapeTile
                shape={item.shape}
                color={item.color}
                size={itemSize * 0.7}
                disabled
                animationState="reveal"
              />
            </View>
          ))}
        </View>
        
        <View style={styles.timerBar}>
          <Animated.View
            style={[
              styles.timerFill,
              {
                width: `${(scaledRevealDuration / 3000) * 100}%`,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  // Render interference phase (full grid, fading in)
  const renderInterferencePhase = () => {
    return (
      <View style={styles.phaseContainer}>
        <Text style={[styles.instructionText, { opacity: 0.6 }]}>
          Preparing...
        </Text>
        
        <View
          style={[
            styles.grid,
            {
              width: availableWidth,
            },
          ]}
        >
          {data.allItems.map((item) => (
            <View
              key={`interference-${item.id}`}
              style={[
                styles.gridItem,
                {
                  width: itemSize,
                  height: itemSize,
                },
              ]}
            >
              <ShapeTile
                shape={item.shape}
                color={item.color}
                size={itemSize * 0.6}
                disabled
                animationState="reveal"
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render action phase (player taps decoys)
  const renderActionPhase = () => {
    const timeProgress = timeRemaining / scaledActionTimeLimit;
    const timeInSeconds = Math.ceil(timeRemaining / 1000);
    
    // Color changes based on time remaining
    let timerColor = '#4CAF50'; // Green
    if (timeProgress < 0.3) {
      timerColor = '#F44336'; // Red
    } else if (timeProgress < 0.5) {
      timerColor = '#FF9800'; // Orange
    }
    
    return (
      <View style={styles.phaseContainer}>
        <View style={styles.headerSection}>
          <Text style={styles.instructionText}>
            Tap what was NOT in the sequence
          </Text>
          
          {/* Countdown Timer */}
          <View style={styles.timerContainer}>
            <View style={styles.timerCircle}>
              <Text style={[styles.timerText, { color: timerColor }]}>
                {timeInSeconds}s
              </Text>
            </View>
            <View style={styles.timerProgressBar}>
              <View
                style={[
                  styles.timerProgressFill,
                  {
                    width: `${timeProgress * 100}%`,
                    backgroundColor: timerColor,
                  },
                ]}
              />
            </View>
          </View>
        </View>
        
        <View
          style={[
            styles.grid,
            {
              width: availableWidth,
            },
          ]}
        >
          {data.allItems.map((item) => {
            const isTapped = tappedItems.has(item.id);
            
            return (
              <View
                key={`action-${item.id}`}
                style={[
                  styles.gridItem,
                  {
                    width: itemSize,
                    height: itemSize,
                  },
                ]}
              >
                <ShapeTile
                  shape={item.shape}
                  color={item.color}
                  size={itemSize * 0.6}
                  onPress={() => handleTap(item.id)}
                  disabled={isTapped || phase !== 'action' || isPaused}
                  animationState={isTapped ? 'pulse' : 'idle'}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Render current phase
  const renderPhase = () => {
    switch (phase) {
      case 'reveal':
        return renderRevealPhase();
      case 'interference':
        return renderInterferencePhase();
      case 'action':
      case 'complete':
        return renderActionPhase();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderPhase()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: GRID_PADDING,
  },
  phaseContainer: {
    alignItems: 'center',
    width: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  timerContainer: {
    alignItems: 'center',
    gap: 12,
  },
  timerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timerText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timerProgressBar: {
    width: 200,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sequenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  sequenceItem: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  gridItem: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  timerBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 16,
  },
  timerFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
});

export default memo(ReverseMemoryPuzzle);
