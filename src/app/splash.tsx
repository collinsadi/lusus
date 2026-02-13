/**
 * Splash Screen
 * Custom in-app splash with realistic animations, gradients, and particle effects
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import type { SplashNote } from '@/services/splash-note-service';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SplashScreenProps {
  note: SplashNote;
  onDismiss: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Floating particle component
interface FloatingParticleProps {
  delay: number;
  duration: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  color: string;
}

const FloatingParticle: React.FC<FloatingParticleProps> = ({
  delay,
  duration,
  startX,
  startY,
  endX,
  endY,
  size,
  color,
}) => {
  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(endX, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(startX, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(endY, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(startY, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: duration / 2 }),
          withTiming(0.2, { duration: duration / 2 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
};

export default function SplashScreen({ note, onDismiss }: SplashScreenProps) {
  const router = useRouter();
  
  // Refs for cleanup
  const reminderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reminderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.8);
  const titleRotate = useSharedValue(-5);
  const noteOpacity = useSharedValue(0);
  const noteTranslateY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);
  const buttonPressScale = useSharedValue(1);
  const buttonGlow = useSharedValue(0);
  const instructionsButtonOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  // Background animations
  const gradientRotation = useSharedValue(0);
  const orb1Position = useSharedValue(0);
  const orb2Position = useSharedValue(0);
  
  // Floating animation
  const floatingAnimation = useSharedValue(0);

  useEffect(() => {
    // Background continuous animations
    gradientRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );

    orb1Position.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    orb2Position.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 10000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Staggered entrance animations
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    titleScale.value = withDelay(
      300,
      withSpring(1, { damping: 15, stiffness: 80 })
    );
    titleRotate.value = withDelay(
      300,
      withSpring(0, { damping: 12, stiffness: 60 })
    );

    noteOpacity.value = withDelay(700, withTiming(1, { duration: 800 }));
    noteTranslateY.value = withDelay(
      700,
      withSpring(0, { damping: 18, stiffness: 70 })
    );

    buttonOpacity.value = withDelay(1100, withTiming(1, { duration: 600 }));
    buttonScale.value = withDelay(
      1100,
      withSpring(1, { damping: 12, stiffness: 100 })
    );

    instructionsButtonOpacity.value = withDelay(1300, withTiming(1, { duration: 600 }));

    // Gentle floating animation for the note
    floatingAnimation.value = withDelay(
      1400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    // Inactivity reminder - vibrate every 5 seconds after 5 seconds of no action
    reminderTimeoutRef.current = setTimeout(() => {
      // First vibration after 5 seconds
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Continue vibrating every 5 seconds
      reminderIntervalRef.current = setInterval(() => {
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }, 5000);
    }, 5000);

    return () => {
      if (reminderTimeoutRef.current) {
        clearTimeout(reminderTimeoutRef.current);
      }
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
      }
    };
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      { scale: titleScale.value },
      { rotate: `${titleRotate.value}deg` },
    ],
  }));

  const noteAnimatedStyle = useAnimatedStyle(() => ({
    opacity: noteOpacity.value,
    transform: [
      { translateY: noteTranslateY.value },
      { translateY: floatingAnimation.value * -8 }, // Gentle floating
    ],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value * buttonPressScale.value }],
  }));

  const instructionsButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: instructionsButtonOpacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const orb1AnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(orb1Position.value, [0, 1], [0, 100]);
    const translateY = interpolate(orb1Position.value, [0, 1], [0, -80]);
    const scale = interpolate(orb1Position.value, [0, 0.5, 1], [1, 1.2, 1]);
    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
    };
  });

  const orb2AnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(orb2Position.value, [0, 1], [0, -120]);
    const translateY = interpolate(orb2Position.value, [0, 1], [0, 100]);
    const scale = interpolate(orb2Position.value, [0, 0.5, 1], [1, 1.15, 1]);
    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
    };
  });

  const handlePlayPress = async () => {
    // Clear reminder timers
    if (reminderTimeoutRef.current) {
      clearTimeout(reminderTimeoutRef.current);
      reminderTimeoutRef.current = null;
    }
    if (reminderIntervalRef.current) {
      clearInterval(reminderIntervalRef.current);
      reminderIntervalRef.current = null;
    }

    // Haptic feedback
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Button press animation
    buttonPressScale.value = withSequence(
      withTiming(0.92, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    // Fade out animation
    setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 400 }, (finished) => {
        'worklet';
        if (finished) {
          // Don't initialize yet - let tutorial handle it for first-time users
          // or main screen will initialize for returning users
          runOnJS(onDismiss)();
        }
      });
    }, 150);
  };

  const handleInstructionsPress = async () => {
    // Clear reminder timers
    if (reminderTimeoutRef.current) {
      clearTimeout(reminderTimeoutRef.current);
      reminderTimeoutRef.current = null;
    }
    if (reminderIntervalRef.current) {
      clearInterval(reminderIntervalRef.current);
      reminderIntervalRef.current = null;
    }

    // Haptic feedback
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    router.push('/rules');
  };

  // Generate floating particles (reduced for minimal design)
  const particles = [];
  const particleCount = 5;
  for (let i = 0; i < particleCount; i++) {
    const startX = Math.random() * SCREEN_WIDTH - SCREEN_WIDTH / 2;
    const startY = Math.random() * SCREEN_HEIGHT - SCREEN_HEIGHT / 2;
    const endX = startX + (Math.random() - 0.5) * 80;
    const endY = startY + (Math.random() - 0.5) * 80;
    const size = 2 + Math.random() * 3;
    const duration = 10000 + Math.random() * 4000;
    const delay = Math.random() * 2000;
    const colors = ['#6366f1', '#8b5cf6'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    particles.push(
      <FloatingParticle
        key={i}
        startX={startX}
        startY={startY}
        endX={endX}
        endY={endY}
        size={size}
        duration={duration}
        delay={delay}
        color={color}
      />
    );
  }

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Simple gradient background */}
      <LinearGradient
        colors={['#0a0a0f', '#1a1a2e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating particles */}
      <View style={styles.particlesContainer}>{particles}</View>

      {/* Single animated orb for subtle effect */}
      <Animated.View style={[styles.orb1, orb1AnimatedStyle]} />

      {/* Content overlay */}
      <View style={styles.contentContainer}>
        {/* Title/Logo */}
        <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
          <Text style={styles.title}>Lusus</Text>
          <Text style={styles.subtitle}>Reverse memory Game</Text>
        </Animated.View>

        {/* Cute Note */}
        <Animated.View style={[styles.noteContainer, noteAnimatedStyle]}>
          <View style={styles.noteCard}>
            {note.emoji && <Text style={styles.noteEmoji}>{note.emoji}</Text>}
            <Text style={styles.noteText}>{note.text}</Text>
          </View>
        </Animated.View>

        {/* Button Group */}
        <View style={styles.buttonGroup}>
          {/* Play Button */}
          <AnimatedPressable
            onPress={handlePlayPress}
            style={[styles.playButton, buttonAnimatedStyle]}
          >
            <LinearGradient
              colors={['#6366f1', '#7c3aed']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButtonGradient}
            >
              <Text style={styles.playButtonText}>Play</Text>
            </LinearGradient>
          </AnimatedPressable>

          {/* Instructions Button */}
          <AnimatedPressable
            onPress={handleInstructionsPress}
            style={[styles.instructionsButton, instructionsButtonAnimatedStyle]}
          >
            <Text style={styles.instructionsButtonText}>How to Play</Text>
          </AnimatedPressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0f',
    zIndex: 9999,
    overflow: 'hidden',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  },
  orb1: {
    position: 'absolute',
    top: 100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#6366f1',
    opacity: 0.08,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 56,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  noteContainer: {
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH - 60,
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  noteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  noteEmoji: {
    fontSize: 40,
    marginBottom: 12,
    textAlign: 'center',
  },
  noteText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonGroup: {
    alignItems: 'center',
    gap: 18,
  },
  playButton: {
    borderRadius: 28,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  playButtonGradient: {
    paddingHorizontal: 56,
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  instructionsButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  instructionsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
    letterSpacing: 0.3,
  },
});
