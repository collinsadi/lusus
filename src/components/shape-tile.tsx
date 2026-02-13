/**
 * Reusable Shape Tile Component
 * Renders geometric shapes with animations and tap feedback
 */
import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

type ShapeType = 'circle' | 'square' | 'triangle';

interface ShapeTileProps {
  shape: ShapeType;
  color: string;
  size?: number;
  onPress?: () => void;
  disabled?: boolean;
  animationState?: 'idle' | 'reveal' | 'hidden' | 'pulse' | 'shake';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ShapeTile: React.FC<ShapeTileProps> = ({
  shape,
  color,
  size = 60,
  onPress,
  disabled = false,
  animationState = 'idle',
}) => {
  const pressed = useSharedValue(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Handle animation states
  React.useEffect(() => {
    switch (animationState) {
      case 'reveal':
        opacity.value = withTiming(1, { duration: 300 });
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
        break;
      case 'hidden':
        opacity.value = withTiming(0.3, { duration: 200 });
        break;
      case 'pulse':
        scale.value = withSpring(1.1, { damping: 10, stiffness: 150 });
        break;
      case 'shake':
        // Shake animation handled by parent
        break;
      case 'idle':
      default:
        opacity.value = withTiming(1, { duration: 200 });
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
        break;
    }
  }, [animationState, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(pressed.value ? 0.92 : scale.value, {
          damping: 15,
          stiffness: 300,
        }),
      },
    ],
    opacity: opacity.value,
  }));

  const renderShape = () => {
    const baseStyle = {
      width: size,
      height: size,
      backgroundColor: color,
    };

    switch (shape) {
      case 'circle':
        return (
          <View
            style={[
              baseStyle,
              styles.shape,
              { borderRadius: size / 2 },
            ]}
          />
        );

      case 'square':
        return (
          <View
            style={[
              baseStyle,
              styles.shape,
              { borderRadius: size * 0.15 },
            ]}
          />
        );

      case 'triangle':
        return (
          <View style={styles.shape}>
            <View
              style={{
                width: 0,
                height: 0,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
                borderLeftWidth: size * 0.5,
                borderRightWidth: size * 0.5,
                borderBottomWidth: size * 0.87, // sqrt(3)/2 for equilateral triangle
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: color,
              }}
            />
          </View>
        );

      default:
        return <View style={[baseStyle, styles.shape]} />;
    }
  };

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle]}
      onPressIn={() => {
        if (!disabled) {
          pressed.value = true;
        }
      }}
      onPressOut={() => {
        pressed.value = false;
      }}
      onPress={onPress}
      disabled={disabled}
    >
      {renderShape()}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  shape: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default memo(ShapeTile);
