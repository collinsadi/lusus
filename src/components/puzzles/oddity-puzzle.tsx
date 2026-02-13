/**
 * Oddity Puzzle Renderer
 * Displays a grid of items where one is different
 */
import React, { memo } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import type { OddityPuzzleData } from '@/types/puzzle';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 40;

interface OddityPuzzleProps {
  data: OddityPuzzleData;
  onTap: (itemId: number) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const OddityPuzzle: React.FC<OddityPuzzleProps> = ({ data, onTap }) => {
  const gridSize = data.gridSize;
  const availableWidth = SCREEN_WIDTH - GRID_PADDING * 2;
  const itemSize = availableWidth / gridSize - 12;

  const renderShape = (item: OddityPuzzleData['items'][0]) => {
    const baseStyle = {
      width: item.size,
      height: item.size,
      backgroundColor: item.color,
      transform: [{ rotate: `${item.rotation}deg` }],
    };

    switch (item.shape) {
      case 'circle':
        return <View style={[baseStyle, { borderRadius: item.size / 2 }]} />;
      case 'square':
        return <View style={[baseStyle, { borderRadius: 4 }]} />;
      case 'triangle':
        return (
          <View
            style={{
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderLeftWidth: item.size / 2,
              borderRightWidth: item.size / 2,
              borderBottomWidth: item.size,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: item.color,
              transform: [{ rotate: `${item.rotation}deg` }],
            }}
          />
        );
      case 'hexagon':
        return (
          <View
            style={[
              baseStyle,
              {
                borderRadius: 8,
                transform: [{ rotate: `${item.rotation + 30}deg` }],
              },
            ]}
          />
        );
      default:
        return <View style={baseStyle} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.grid, { width: availableWidth }]}>
        {data.items.map((item) => {
          const pressed = useSharedValue(false);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [
              {
                scale: withSpring(pressed.value ? 0.9 : 1, {
                  damping: 15,
                  stiffness: 300,
                }),
              },
            ],
          }));

          return (
            <AnimatedPressable
              key={item.id}
              style={[
                styles.gridItem,
                {
                  width: itemSize,
                  height: itemSize,
                },
                animatedStyle,
              ]}
              onPressIn={() => {
                pressed.value = true;
              }}
              onPressOut={() => {
                pressed.value = false;
              }}
              onPress={() => onTap(item.id)}
            >
              <View style={styles.shapeContainer}>{renderShape(item)}</View>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: GRID_PADDING,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  shapeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(OddityPuzzle);
