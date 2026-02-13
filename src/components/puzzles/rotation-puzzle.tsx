/**
 * Rotation Puzzle Renderer
 * Displays a shape that user must rotate to match the outline
 */
import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import type { RotationPuzzleData } from '@/types/puzzle';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHAPE_SIZE = 120;

interface RotationPuzzleProps {
  data: RotationPuzzleData;
  onRotate: (rotation: number) => void;
}

const RotationPuzzle: React.FC<RotationPuzzleProps> = ({ data, onRotate }) => {
  const rotation = useSharedValue(data.currentRotation);
  const savedRotation = useSharedValue(data.currentRotation);

  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + (event.rotation * 180) / Math.PI;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      onRotate(rotation.value % 360);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const renderShape = () => {
    switch (data.shape) {
      case 'triangle':
        return (
          <View
            style={{
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderLeftWidth: SHAPE_SIZE / 2,
              borderRightWidth: SHAPE_SIZE / 2,
              borderBottomWidth: SHAPE_SIZE,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: data.shapeColor,
            }}
          />
        );
      case 'arrow':
        return (
          <View style={[styles.arrow, { borderBottomColor: data.shapeColor }]}>
            <View style={[styles.arrowHead, { borderBottomColor: data.shapeColor }]} />
          </View>
        );
      case 'star':
        return (
          <View style={[styles.star, { backgroundColor: data.shapeColor }]} />
        );
      case 'polygon':
      default:
        return (
          <View
            style={[
              styles.polygon,
              {
                backgroundColor: data.shapeColor,
                width: SHAPE_SIZE,
                height: SHAPE_SIZE,
              },
            ]}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Target outline */}
      <View
        style={[
          styles.targetOutline,
          { transform: [{ rotate: `${data.targetRotation}deg` }] },
        ]}
      >
        <View style={styles.outlineShape} />
      </View>

      {/* Interactive shape */}
      <GestureDetector gesture={rotationGesture}>
        <Animated.View style={[styles.shapeContainer, animatedStyle]}>
          {renderShape()}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetOutline: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineShape: {
    width: SHAPE_SIZE + 20,
    height: SHAPE_SIZE + 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  shapeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    width: SHAPE_SIZE,
    height: SHAPE_SIZE / 2,
    borderBottomWidth: SHAPE_SIZE / 2,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: SHAPE_SIZE / 4,
    borderRightWidth: SHAPE_SIZE / 4,
    borderBottomWidth: SHAPE_SIZE / 2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  star: {
    width: SHAPE_SIZE,
    height: SHAPE_SIZE,
    borderRadius: SHAPE_SIZE / 10,
  },
  polygon: {
    borderRadius: 12,
  },
});

export default memo(RotationPuzzle);
