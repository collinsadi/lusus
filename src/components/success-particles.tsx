/**
 * Success Particles
 * Enhanced animated particles that burst on puzzle success with varied shapes and effects
 */
import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParticleProps {
  color: string;
  angle: number;
  delay: number;
  size: number;
  shape: 'circle' | 'square' | 'star';
}

const Particle: React.FC<ParticleProps> = ({ color, angle, delay, size, shape }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.5);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const distance = 120 + Math.random() * 150;
    const radians = (angle * Math.PI) / 180;

    // Initial scale burst
    scale.value = withDelay(
      delay,
      withSpring(1.5, {
        damping: 8,
        stiffness: 100,
      })
    );

    // Movement
    translateX.value = withDelay(
      delay,
      withTiming(Math.cos(radians) * distance, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      })
    );
    translateY.value = withDelay(
      delay,
      withTiming(Math.sin(radians) * distance + 30, {
        duration: 1000,
        easing: Easing.in(Easing.quad),
      })
    );

    // Fade out
    opacity.value = withDelay(
      delay + 300,
      withTiming(0, {
        duration: 700,
        easing: Easing.out(Easing.quad),
      })
    );

    // Shrink
    scale.value = withDelay(
      delay + 400,
      withTiming(0.3, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      })
    );

    // Rotation for visual variety
    rotation.value = withDelay(
      delay,
      withTiming(Math.random() > 0.5 ? 360 : -360, {
        duration: 1000,
        easing: Easing.out(Easing.quad),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const getParticleStyle = () => {
    const baseStyle = {
      backgroundColor: color,
      width: size,
      height: size,
    };

    switch (shape) {
      case 'circle':
        return { ...baseStyle, borderRadius: size / 2 };
      case 'square':
        return { ...baseStyle, borderRadius: size * 0.2 };
      case 'star':
        return {
          ...baseStyle,
          borderRadius: size * 0.15,
          transform: [{ rotate: '45deg' }],
        };
      default:
        return { ...baseStyle, borderRadius: size / 2 };
    }
  };

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <Animated.View style={[getParticleStyle(), styles.particleInner]} />
    </Animated.View>
  );
};

interface SuccessParticlesProps {
  colors: string[];
  show: boolean;
}

const SuccessParticles: React.FC<SuccessParticlesProps> = ({ colors, show }) => {
  if (!show) return null;

  const particleCount = 20;
  const particles = [];
  const shapes: ('circle' | 'square' | 'star')[] = ['circle', 'square', 'star'];

  for (let i = 0; i < particleCount; i++) {
    const angle = (360 / particleCount) * i + Math.random() * 15;
    const color = colors[i % colors.length];
    const delay = i * 25;
    const size = 8 + Math.random() * 8; // Varied sizes between 8-16
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    particles.push(
      <Particle
        key={i}
        color={color}
        angle={angle}
        delay={delay}
        size={size}
        shape={shape}
      />
    );
  }

  // Add some extra larger particles for emphasis
  for (let i = 0; i < 8; i++) {
    const angle = (360 / 8) * i;
    const color = colors[i % colors.length];
    const delay = i * 40;

    particles.push(
      <Particle
        key={`large-${i}`}
        color={color}
        angle={angle}
        delay={delay}
        size={12}
        shape="circle"
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default SuccessParticles;
