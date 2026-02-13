/**
 * Rule Switch Puzzle Renderer
 * Displays items where the target rule switches mid-game
 */
import React, { memo, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import type { RuleSwitchPuzzleData } from '@/types/puzzle';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_SIZE = 70;

interface RuleSwitchPuzzleProps {
  data: RuleSwitchPuzzleData;
  onTap: (itemId: number) => void;
  startTime: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const RuleSwitchPuzzle: React.FC<RuleSwitchPuzzleProps> = ({ data, onTap, startTime }) => {
  const [currentRule, setCurrentRule] = useState(data.currentRule);
  const ruleOpacity = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentRule(currentRule === 'color' ? 'shape' : 'color');
      // Flash animation on rule switch
      ruleOpacity.value = 0;
      ruleOpacity.value = withSpring(1, { damping: 10 });
    }, data.switchTiming);

    return () => clearTimeout(timer);
  }, [data.switchTiming]);

  const ruleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ruleOpacity.value,
  }));

  const renderShape = (item: RuleSwitchPuzzleData['items'][0]) => {
    const baseStyle = {
      width: ITEM_SIZE * 0.6,
      height: ITEM_SIZE * 0.6,
      backgroundColor: item.color,
    };

    switch (item.shape) {
      case 'circle':
        return <View style={[baseStyle, { borderRadius: ITEM_SIZE * 0.3 }]} />;
      case 'square':
        return <View style={[baseStyle, { borderRadius: 8 }]} />;
      case 'triangle':
        return (
          <View
            style={{
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderLeftWidth: ITEM_SIZE * 0.3,
              borderRightWidth: ITEM_SIZE * 0.3,
              borderBottomWidth: ITEM_SIZE * 0.6,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: item.color,
            }}
          />
        );
      default:
        return <View style={baseStyle} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Rule indicator */}
      <Animated.View style={[styles.ruleIndicator, ruleAnimatedStyle]}>
        <View style={styles.ruleBox}>
          <View style={styles.ruleContent}>
            {currentRule === 'color' ? (
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: data.targetColor },
                ]}
              />
            ) : (
              <View style={styles.shapeIndicatorContainer}>
                {renderShape({ id: -1, color: '#fff', shape: data.targetShape })}
              </View>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Items grid */}
      <View style={styles.itemsGrid}>
        {data.items.map((item) => {
          const pressed = useSharedValue(false);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [
              {
                scale: withSpring(pressed.value ? 0.85 : 1, {
                  damping: 12,
                  stiffness: 200,
                }),
              },
            ],
          }));

          return (
            <AnimatedPressable
              key={item.id}
              style={[styles.item, animatedStyle]}
              onPressIn={() => {
                pressed.value = true;
              }}
              onPressOut={() => {
                pressed.value = false;
              }}
              onPress={() => onTap(item.id)}
            >
              {renderShape(item)}
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
    paddingHorizontal: 20,
  },
  ruleIndicator: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
  },
  ruleBox: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ruleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shapeIndicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    maxWidth: SCREEN_WIDTH - 40,
    marginTop: 60,
  },
  item: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});

export default memo(RuleSwitchPuzzle);
