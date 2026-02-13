/**
 * Timing Puzzle Renderer
 * Displays a moving indicator that user must tap at the right moment
 */
import React, { memo, useEffect } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import type { TimingPuzzleData } from '@/types/puzzle';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const INDICATOR_SIZE = 24;
const PATH_LENGTH = 300;

interface TimingPuzzleProps {
  data: TimingPuzzleData;
  onTap: (position: number) => void;
}

const TimingPuzzle: React.FC<TimingPuzzleProps> = ({ data, onTap }) => {
  const position = useSharedValue(0);

  useEffect(() => {
    // Calculate duration based on speed
    const duration = (PATH_LENGTH / data.speed) * 1000;

    position.value = withRepeat(
      withTiming(PATH_LENGTH, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => {
      cancelAnimation(position);
    };
  }, [data.speed]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    if (data.cycleDirection === 'horizontal') {
      return {
        transform: [{ translateX: position.value - PATH_LENGTH / 2 }],
      };
    } else {
      return {
        transform: [{ translateY: position.value - PATH_LENGTH / 2 }],
      };
    }
  });

  const handleTap = () => {
    onTap(position.value);
  };

  const targetZoneSize = data.targetZone.end - data.targetZone.start;
  const targetZonePosition = data.targetZone.start + targetZoneSize / 2;

  const targetZoneStyle =
    data.cycleDirection === 'horizontal'
      ? {
          left: targetZonePosition - targetZoneSize / 2,
          width: targetZoneSize,
          height: 4,
        }
      : {
          top: targetZonePosition - targetZoneSize / 2,
          height: targetZoneSize,
          width: 4,
        };

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      <View style={styles.trackContainer}>
        <View
          style={[
            styles.track,
            data.cycleDirection === 'horizontal' ? styles.horizontalTrack : styles.verticalTrack,
          ]}
        >
          <View style={[styles.targetZone, targetZoneStyle]} />
          <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  trackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalTrack: {
    width: PATH_LENGTH,
    height: 80,
    flexDirection: 'row',
  },
  verticalTrack: {
    width: 80,
    height: PATH_LENGTH,
    flexDirection: 'column',
  },
  targetZone: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: 4,
    position: 'absolute',
  },
  indicator: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default memo(TimingPuzzle);
