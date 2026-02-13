/**
 * Error Particles
 * Animated particles that appear on puzzle failure
 */
import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ErrorParticleProps {
  color: string;
  delay: number;
  xStart: number;
  direction: 'left' | 'right';
}

const ErrorParticle: React.FC<ErrorParticleProps> = ({ color, delay, xStart, direction }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const distance = 60 + Math.random() * 40;
    const xDirection = direction === 'left' ? -1 : 1;

    // Quick shake effect
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(xDirection * 10, { duration: 50 }),
        withTiming(xDirection * -8, { duration: 50 }),
        withTiming(xDirection * 6, { duration: 50 }),
        withTiming(xDirection * distance, {
          duration: 400,
          easing: Easing.out(Easing.quad),
        })
      )
    );

    // Drop down
    translateY.value = withDelay(
      delay + 150,
      withTiming(80 + Math.random() * 40, {
        duration: 450,
        easing: Easing.in(Easing.quad),
      })
    );

    // Fade in and out
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0.8, { duration: 300 }),
        withTiming(0, { duration: 300 })
      )
    );

    // Scale bounce
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.3, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(0.8, { duration: 500, easing: Easing.in(Easing.quad) })
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <Animated.View
        style={[
          styles.particleInner,
          { backgroundColor: color, transform: [{ rotate: '45deg' }] },
        ]}
      />
    </Animated.View>
  );
};

interface ErrorParticlesProps {
  colors: string[];
  show: boolean;
}

const ErrorParticles: React.FC<ErrorParticlesProps> = ({ colors, show }) => {
  if (!show) return null;

  const particleCount = 12;
  const particles = [];

  // Create particles from the center, falling to the sides
  for (let i = 0; i < particleCount; i++) {
    const color = colors[i % colors.length];
    const delay = i * 40;
    const xStart = (i - particleCount / 2) * 15;
    const direction = i < particleCount / 2 ? 'left' : 'right';

    particles.push(
      <ErrorParticle
        key={i}
        color={color}
        delay={delay}
        xStart={xStart}
        direction={direction}
      />
    );
  }

  return <Animated.View style={styles.container}>{particles}</Animated.View>;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
  },
  particleInner: {
    width: 6,
    height: 6,
    borderRadius: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default ErrorParticles;
