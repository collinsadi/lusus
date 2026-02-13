/**
 * Stats Display
 * Shows session statistics
 */
import type { SessionStats } from '@/types/puzzle';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StatsDisplayProps {
  stats: SessionStats;
  onReset?: () => void;
  timeRemaining?: number; // Timer in milliseconds (0 when inactive)
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, onReset, timeRemaining }) => {
  const timeInSeconds = timeRemaining ? Math.ceil(timeRemaining / 1000) : 0;
  
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{timeInSeconds}s</Text>
          <Text style={styles.statLabel}>Time</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalPuzzles}</Text>
          <Text style={styles.statLabel}>Solved</Text>
        </View>
      </View>
      {onReset && (
        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <Text style={styles.resetIcon}>↻</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  separator: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetIcon: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
  },
});

export default StatsDisplay;
