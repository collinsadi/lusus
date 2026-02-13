/**
 * Feedback Overlay
 * Displays visual feedback after puzzle completion with modern animations and effects
 */
import type { EvaluationResult } from '@/types/puzzle';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
    withRepeat,
    interpolate,
    Extrapolation,
    useAnimatedProps,
} from 'react-native-reanimated';
import Svg, { Path, Circle, G } from 'react-native-svg';
import SuccessParticles from './success-particles';
import ErrorParticles from './error-particles';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FeedbackOverlayProps {
  result: EvaluationResult | null;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ result }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const iconProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (!result) {
      opacity.value = 0;
      scale.value = 0.8;
      iconProgress.value = 0;
      glowOpacity.value = 0;
      rotation.value = 0;
      setShowParticles(false);
      return;
    }

    // Show particles for both success and error
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1500);

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

    // Animate icon drawing
    iconProgress.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
    });

    // Animate glow effect
    glowOpacity.value = withSequence(
      withTiming(0.8, { duration: 200 }),
      withRepeat(
        withSequence(
          withTiming(0.4, { duration: 400 }),
          withTiming(0.8, { duration: 400 })
        ),
        2,
        false
      ),
      withTiming(0, { duration: 300 })
    );

    // Animate feedback
    if (result.feedback.animation === 'burst') {
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0.7, { duration: 300 }),
        withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
      );
      scale.value = withSequence(
        withSpring(1, { damping: 10 }),
        withSpring(1.05, { damping: 8 }),
        withTiming(1.2, { duration: 400 })
      );
      rotation.value = withSpring(360, { damping: 15 });
    } else if (result.feedback.animation === 'shake') {
      opacity.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(0, { duration: 800 })
      );
      // Shake animation for errors
      rotation.value = withSequence(
        withTiming(-15, { duration: 60 }),
        withTiming(15, { duration: 60 }),
        withTiming(-12, { duration: 60 }),
        withTiming(12, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
      scale.value = withSequence(
        withSpring(1, { damping: 10 }),
        withTiming(0.8, { duration: 400 })
      );
    } else {
      opacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 600 })
      );
      scale.value = withSpring(1, { damping: 10 });
    }
  }, [result]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.3,
    transform: [{ scale: scale.value }],
  }));

  const iconContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: scale.value * 1.2 }],
  }));

  const checkmarkAnimatedProps = useAnimatedProps(() => {
    const length = 100;
    const dashoffset = interpolate(
      iconProgress.value,
      [0, 1],
      [length, 0],
      Extrapolation.CLAMP
    );
    return {
      strokeDashoffset: dashoffset,
    };
  });

  if (!result) return null;

  const isSuccess = result.success;
  const primaryColor = isSuccess
    ? result.feedback.colorBurst?.[0] || '#10B981'
    : result.feedback.colorBurst?.[0] || '#EF4444';
  const secondaryColor = isSuccess ? '#34D399' : '#F87171';

  return (
    <>
      {/* Background overlay with gradient effect */}
      <Animated.View
        style={[
          styles.overlay,
          overlayAnimatedStyle,
          { backgroundColor: primaryColor },
        ]}
        pointerEvents="none"
      />
      
      {/* Glow effect */}
      <Animated.View style={[styles.glowContainer, glowStyle]} pointerEvents="none">
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: primaryColor,
              shadowColor: primaryColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 50,
            },
          ]}
        />
      </Animated.View>

      {/* Central icon */}
      <Animated.View style={[styles.iconContainer, iconContainerStyle]} pointerEvents="none">
        <Svg width="120" height="120" viewBox="0 0 120 120">
          {/* Background circle */}
          <Circle
            cx="60"
            cy="60"
            r="50"
            fill={primaryColor}
            opacity={0.2}
          />
          
          {/* Outer ring */}
          <Circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={primaryColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
          
          {isSuccess ? (
            // Checkmark
            <AnimatedPath
              d="M 35 60 L 52 77 L 85 44"
              fill="none"
              stroke={secondaryColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="100"
              animatedProps={checkmarkAnimatedProps}
            />
          ) : (
            // X mark
            <G>
              <AnimatedPath
                d="M 42 42 L 78 78"
                fill="none"
                stroke={secondaryColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="100"
                animatedProps={checkmarkAnimatedProps}
              />
              <AnimatedPath
                d="M 78 42 L 42 78"
                fill="none"
                stroke={secondaryColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="100"
                animatedProps={checkmarkAnimatedProps}
              />
            </G>
          )}
        </Svg>
      </Animated.View>

      {/* Particles */}
      {result?.success ? (
        <SuccessParticles colors={result.feedback.colorBurst || ['#10B981', '#34D399', '#6EE7B7']} show={showParticles} />
      ) : (
        <ErrorParticles colors={result.feedback.colorBurst || ['#EF4444', '#F87171', '#FCA5A5']} show={showParticles} />
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
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  glow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    elevation: 20,
  },
  iconContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 60,
    left: SCREEN_WIDTH / 2 - 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
});

export default FeedbackOverlay;
