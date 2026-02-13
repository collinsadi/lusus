/**
 * Splash Screen
 * Custom in-app splash with random cute note and play button
 */
import React, { useEffect } from 'react';
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
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import type { SplashNote } from '@/services/splash-note-service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SplashScreenProps {
  note: SplashNote;
  onDismiss: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SplashScreen({ note, onDismiss }: SplashScreenProps) {
  const router = useRouter();
  
  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.8);
  const noteOpacity = useSharedValue(0);
  const noteTranslateY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);
  const buttonPressScale = useSharedValue(1);
  const instructionsButtonOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  // Floating animation
  const floatingAnimation = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animations
    titleOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    titleScale.value = withDelay(
      100,
      withSpring(1, { damping: 12, stiffness: 100 })
    );

    noteOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    noteTranslateY.value = withDelay(
      400,
      withSpring(0, { damping: 15, stiffness: 80 })
    );

    buttonOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
    buttonScale.value = withDelay(
      700,
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    instructionsButtonOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));

    // Gentle floating animation for the note
    floatingAnimation.value = withDelay(
      1000,
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      )
    );

    // Repeat floating animation
    const interval = setInterval(() => {
      floatingAnimation.value = withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
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
    transform: [
      { scale: buttonScale.value * buttonPressScale.value },
    ],
  }));

  const instructionsButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: instructionsButtonOpacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const handlePlayPress = async () => {
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
          runOnJS(onDismiss)();
        }
      });
    }, 150);
  };

  const handleInstructionsPress = async () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    router.push('/rules');
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Title/Logo */}
      <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
        <Text style={styles.title}>Lusus</Text>
        <Text style={styles.subtitle}>micro puzzles</Text>
      </Animated.View>

      {/* Cute Note */}
      <Animated.View style={[styles.noteContainer, noteAnimatedStyle]}>
        {note.emoji && (
          <Text style={styles.noteEmoji}>{note.emoji}</Text>
        )}
        <Text style={styles.noteText}>{note.text}</Text>
      </Animated.View>

      {/* Button Group */}
      <View style={styles.buttonGroup}>
        {/* Play Button */}
        <AnimatedPressable
          onPress={handlePlayPress}
          style={[styles.playButton, buttonAnimatedStyle]}
        >
          <Text style={styles.playButtonText}>Play</Text>
        </AnimatedPressable>

        {/* Instructions Button */}
        <AnimatedPressable
          onPress={handleInstructionsPress}
          style={[styles.instructionsButton, instructionsButtonAnimatedStyle]}
        >
          <Text style={styles.instructionsButtonText}>How to Play</Text>
        </AnimatedPressable>
      </View>

      {/* Optional decorative elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 9999,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 56,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8b8b9a',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: 8,
    textAlign: 'center',
  },
  noteContainer: {
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH - 80,
    marginBottom: 80,
    paddingHorizontal: 20,
  },
  noteEmoji: {
    fontSize: 48,
    marginBottom: 16,
    textAlign: 'center',
  },
  noteText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e0e0ea',
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonGroup: {
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  playButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  instructionsButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  instructionsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b8b9a',
    letterSpacing: 0.5,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: 100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#6366f1',
    opacity: 0.05,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 150,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#8b5cf6',
    opacity: 0.05,
  },
});
