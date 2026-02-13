/**
 * Unified Puzzle Renderer
 * Selects and renders the appropriate puzzle component based on type
 */
import type {
    OddityPuzzleData,
    PuzzleInstance,
    ReverseMemoryPuzzleData,
    RotationPuzzleData,
    RuleSwitchPuzzleData,
    TimingPuzzleData,
    UserInteraction,
} from '@/types/puzzle';
import React, { memo, useCallback } from 'react';

import OddityPuzzle from './oddity-puzzle';
import ReverseMemoryPuzzle from './reverse-memory-puzzle';
import RotationPuzzle from './rotation-puzzle';
import RuleSwitchPuzzle from './rule-switch-puzzle';
import TimingPuzzle from './timing-puzzle';

interface PuzzleRendererProps {
  instance: PuzzleInstance;
  onInteraction: (interaction: UserInteraction) => void;
  currentStreak?: number; // For speed scaling in applicable puzzles
}

const PuzzleRenderer: React.FC<PuzzleRendererProps> = ({ instance, onInteraction, currentStreak = 0 }) => {
  const createInteraction = useCallback(
    (type: UserInteraction['type'], data: UserInteraction['data']) => {
      onInteraction({
        timestamp: Date.now(),
        type,
        data,
      });
    },
    [onInteraction]
  );

  switch (instance.definition.type) {
    case 'oddity':
      return (
        <OddityPuzzle
          data={instance.data as OddityPuzzleData}
          onTap={(itemId) => createInteraction('tap', { itemId })}
        />
      );

    case 'timing':
      return (
        <TimingPuzzle
          data={instance.data as TimingPuzzleData}
          onTap={(position) => createInteraction('tap', { position })}
        />
      );

    case 'rotation':
      return (
        <RotationPuzzle
          data={instance.data as RotationPuzzleData}
          onRotate={(rotation) => createInteraction('rotate', { rotation })}
        />
      );

    case 'rule-switch':
      return (
        <RuleSwitchPuzzle
          data={instance.data as RuleSwitchPuzzleData}
          onTap={(itemId) => createInteraction('tap', { itemId })}
          startTime={instance.startTime}
        />
      );

    case 'reverse-memory':
      return (
        <ReverseMemoryPuzzle
          data={instance.data as ReverseMemoryPuzzleData}
          onTap={(itemId) => createInteraction('tap', { itemId })}
          currentStreak={currentStreak}
        />
      );

    default:
      return null;
  }
};

export default memo(PuzzleRenderer);
