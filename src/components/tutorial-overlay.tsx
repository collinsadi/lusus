/**
 * Tutorial Overlay
 * First-time user onboarding that explains the game rules step-by-step
 */
import React, { useEffect, useState } from 'react';
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
  withTiming,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TutorialOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
  onInitialize: () => void; // Called to start the game after tutorial
}

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Lusus! 👋',
    description: 'Let me guide you through how to play this memory puzzle game.',
    icon: 'brain' as const,
    color: '#6366f1',
  },
  {
    title: 'Step 1: Memorize 🧠',
    description: 'First, you\'ll see shapes displayed on screen. Remember them carefully!',
    icon: 'eye' as const,
    color: '#8b5cf6',
  },
  {
    title: 'Step 2: Find the New One 🔍',
    description: 'Then, you\'ll see MORE shapes. Your job is to tap a shape that was NOT in the original list you memorized.',
    icon: 'magnify' as const,
    color: '#ec4899',
  },
  {
    title: 'Step 3: Beat the Timer ⏱️',
    description: 'You start with 10 seconds. For every 5-streak milestone, your timer reduces by 2 seconds (min 3s). The timer never goes back up!',
    icon: 'timer-sand' as const,
    color: '#f59e0b',
  },
  {
    title: 'Build Your Streak! 🔥',
    description: 'Each correct answer increases your streak. Fail once, and you lose it all! Reach 100 streak for a unique shareable card!',
    icon: 'fire' as const,
    color: '#ef4444',
  },
  {
    title: 'Ready to Play? 🎮',
    description: 'You\'re all set! Remember: spot what\'s NEW, not what you memorized. Good luck!',
    icon: 'controller-classic' as const,
    color: '#10b981',
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TutorialOverlay({ onComplete, onSkip, onInitialize }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Animation values
  const containerOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.9);
  const contentOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const skipButtonOpacity = useSharedValue(1);

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const progress = (currentStep + 1) / TUTORIAL_STEPS.length;

  useEffect(() => {
    // Entrance animation
    containerOpacity.value = withTiming(1, { duration: 300 });
    contentScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    contentOpacity.value = withTiming(1, { duration: 400 });
  }, []);

  useEffect(() => {
    // Step transition animation
    contentOpacity.value = withSequence(
      withTiming(0, { duration: 200 }),
      withTiming(1, { duration: 400 })
    );
    contentScale.value = withSequence(
      withTiming(0.95, { duration: 200 }),
      withSpring(1, { damping: 15, stiffness: 100 })
    );
  }, [currentStep]);

  const handleNext = async () => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    if (isLastStep) {
      // Complete tutorial and initialize game
      containerOpacity.value = withTiming(0, { duration: 400 }, (finished) => {
        'worklet';
        if (finished) {
          // Initialize game first, then mark tutorial as complete
          runOnJS(onInitialize)();
          runOnJS(onComplete)();
        }
      });
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = async () => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    skipButtonOpacity.value = withTiming(0.5, { duration: 100 });
    containerOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
      'worklet';
      if (finished) {
        // Initialize game first, then mark tutorial as skipped
        runOnJS(onInitialize)();
        runOnJS(onSkip)();
      }
    });
  };

  const handlePrevious = async () => {
    if (currentStep === 0) return;

    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setCurrentStep((prev) => prev - 1);
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const skipButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: skipButtonOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Simple gradient background */}
      <LinearGradient
        colors={['rgba(10, 10, 15, 0.96)', 'rgba(20, 20, 35, 0.96)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Skip button */}
      <AnimatedPressable
        onPress={handleSkip}
        style={[styles.skipButton, skipButtonAnimatedStyle]}
      >
        <Text style={styles.skipButtonText}>Skip</Text>
      </AnimatedPressable>

      {/* Content */}
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: step.color + '15' }]}>
          <MaterialCommunityIcons name={step.icon} size={48} color={step.color} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{step.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{step.description}</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: step.color,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </Text>
        </View>

        {/* Navigation buttons */}
        <View style={styles.buttonContainer}>
          {/* Previous button (only show if not first step) */}
          {currentStep > 0 && (
            <Pressable
              onPress={handlePrevious}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <MaterialCommunityIcons name="chevron-left" size={20} color="#9ca3af" />
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
          )}

          {/* Next/Finish button */}
          <AnimatedPressable
            onPress={handleNext}
            style={[
              styles.primaryButton,
              buttonAnimatedStyle,
              currentStep === 0 && styles.primaryButtonFull,
            ]}
          >
            <LinearGradient
              colors={[step.color, step.color + 'dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>
                {isLastStep ? "Let's Play!" : 'Next'}
              </Text>
              {!isLastStep && (
                <MaterialCommunityIcons name="chevron-right" size={20} color="#ffffff" />
              )}
            </LinearGradient>
          </AnimatedPressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
  },
  content: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '400',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonFull: {
    flex: 1,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9ca3af',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
