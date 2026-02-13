/**
 * Success Particles
 * Animated particles that burst on puzzle success
 */
import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParticleProps {
  color: string;
  angle: number;
  delay: number;
}

const Particle: React.FC<ParticleProps> = ({ color, angle, delay }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    const distance = 100 + Math.random() * 100;
    const radians = (angle * Math.PI) / 180;

    translateX.value = withDelay(
      delay,
      withTiming(Math.cos(radians) * distance, {
        duration: 800,
        easing: Easing.out(Easing.quad),
      })
    );
    translateY.value = withDelay(
      delay,
      withTiming(Math.sin(radians) * distance, {
        duration: 800,
        easing: Easing.out(Easing.quad),
      })
    );
    opacity.value = withDelay(
      delay,
      withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.quad),
      })
    );
    scale.value = withDelay(
      delay,
      withTiming(0.5, {
        duration: 800,
        easing: Easing.out(Easing.quad),
      })
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

  return <Animated.View style={[styles.particle, { backgroundColor: color }, animatedStyle]} />;
};

interface SuccessParticlesProps {
  colors: string[];
  show: boolean;
}

const SuccessParticles: React.FC<SuccessParticlesProps> = ({ colors, show }) => {
  if (!show) return null;

  const particleCount = 12;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (360 / particleCount) * i;
    const color = colors[i % colors.length];
    const delay = i * 30;

    particles.push(<Particle key={i} color={color} angle={angle} delay={delay} />);
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
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default SuccessParticles;
