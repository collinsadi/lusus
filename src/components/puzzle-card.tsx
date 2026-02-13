/**
 * Puzzle Card
 * Animated wrapper for puzzle content with transitions
 */
import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PuzzleCardProps {
  children: React.ReactNode;
  isActive: boolean;
}

const PuzzleCard: React.FC<PuzzleCardProps> = ({ children, isActive }) => {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    } else {
      scale.value = withTiming(0.95, {
        duration: 200,
      });
      opacity.value = withTiming(0.7, {
        duration: 200,
      });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.card, animatedStyle]}>{children}</Animated.View>;
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PuzzleCard;
