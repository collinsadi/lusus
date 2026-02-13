/**
 * Reverse Memory Puzzle Renderer
 * Implements reveal -> interference -> player action game loop
 */
import { PuzzleDifficultyController } from '@/services/puzzles/engine/difficulty-controller';
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
}

const ReverseMemoryPuzzle: React.FC<ReverseMemoryPuzzleProps> = ({ data, onTap }) => {
  const [phase, setPhase] = useState<GamePhase>('reveal');
  const [tappedItems, setTappedItems] = useState<Set<number>>(new Set());
  
  const fadeOpacity = useSharedValue(0);
  const instructionOpacity = useSharedValue(1);

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

  // Phase lifecycle management
  useEffect(() => {
    fadeOpacity.value = withTiming(1, { duration: 300 });
    
    // Phase 1: Reveal sequence
    if (phase === 'reveal') {
      const revealTimer = setTimeout(() => {
        setPhase('interference');
      }, data.revealDuration);

      return () => clearTimeout(revealTimer);
    }

    // Phase 2: Show interference grid
    if (phase === 'interference') {
      instructionOpacity.value = withTiming(0, { duration: 300 });
      
      const interferenceTimer = setTimeout(() => {
        setPhase('action');
      }, 800);

      return () => clearTimeout(interferenceTimer);
    }
  }, [phase, data.revealDuration, fadeOpacity, instructionOpacity]);

  // Handle tap
  const handleTap = useCallback(
    (itemId: number) => {
      if (phase !== 'action') return;
      
      // Prevent double-tap
      if (tappedItems.has(itemId)) return;

      setTappedItems(prev => new Set(prev).add(itemId));
      
      // Submit interaction
      onTap(itemId);
      
      // Mark as complete after submission
      setPhase('complete');
    },
    [phase, tappedItems, onTap]
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
                width: `${(data.revealDuration / 3000) * 100}%`,
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
    return (
      <View style={styles.phaseContainer}>
        <Text style={styles.instructionText}>
          Tap what was NOT in the sequence
        </Text>
        
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
                  disabled={isTapped || phase !== 'action'}
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
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 0.5,
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
