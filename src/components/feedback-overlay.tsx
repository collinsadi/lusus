/**
 * Feedback Overlay
 * Displays visual feedback after puzzle completion
 */
import type { EvaluationResult } from '@/types/puzzle';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import SuccessParticles from './success-particles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FeedbackOverlayProps {
  result: EvaluationResult | null;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ result }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (!result) {
      opacity.value = 0;
      scale.value = 0.8;
      setShowParticles(false);
      return;
    }

    // Show particles for success
    if (result.success) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    }

    // Trigger haptic feedback
    const hapticType = result.feedback.hapticIntensity;
    if (result.success) {
      if (hapticType === 'heavy') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (hapticType === 'medium') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Animate feedback
    if (result.feedback.animation === 'burst') {
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
      );
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1.5, { damping: 10 })
      );
    } else if (result.feedback.animation === 'shake') {
      opacity.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withTiming(0, { duration: 600 })
      );
      scale.value = withSequence(
        withTiming(0.95, { duration: 50 }),
        withTiming(1.05, { duration: 50 }),
        withTiming(0.95, { duration: 50 }),
        withTiming(1, { duration: 50 })
      );
    } else {
      opacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 500 })
      );
      scale.value = withSpring(1.1, { damping: 10 });
    }
  }, [result]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!result) return null;

  const backgroundColor = result.success
    ? result.feedback.colorBurst?.[0] || '#4CAF50'
    : result.feedback.colorBurst?.[0] || '#F44336';

  return (
    <>
      <Animated.View
        style={[
          styles.overlay,
          animatedStyle,
          { backgroundColor: backgroundColor + '40' },
        ]}
        pointerEvents="none"
      />
      {result?.success && (
        <SuccessParticles colors={result.feedback.colorBurst || ['#4CAF50']} show={showParticles} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SCREEN_HEIGHT / 2,
  },
});

export default FeedbackOverlay;
