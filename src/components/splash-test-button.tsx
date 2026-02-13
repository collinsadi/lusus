/**
 * Splash Test Button
 * Development utility for testing splash screen
 * 
 * Usage: Add this component anywhere in your app during development
 * to easily reset and test the splash screen
 * 
 * Example:
 * ```tsx
 * import SplashTestButton from '@/components/splash-test-button';
 * 
 * // In your component:
 * <SplashTestButton />
 * ```
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSplashContext } from '@/context/splash-context';

interface SplashTestButtonProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export default function SplashTestButton({ 
  position = 'bottom-right' 
}: SplashTestButtonProps) {
  const { resetSplash, shouldShowSplash } = useSplashContext();

  const positionStyles = {
    'top-right': { top: 60, right: 20 },
    'bottom-right': { bottom: 40, right: 20 },
    'top-left': { top: 60, left: 20 },
    'bottom-left': { bottom: 40, left: 20 },
  };

  // Only show in development
  if (__DEV__ === false) {
    return null;
  }

  return (
    <View style={[styles.container, positionStyles[position]]}>
      <TouchableOpacity
        style={styles.button}
        onPress={resetSplash}
      >
        <Text style={styles.icon}>🎬</Text>
        <Text style={styles.label}>Reset Splash</Text>
      </TouchableOpacity>
      
      {shouldShowSplash && (
        <View style={styles.indicator}>
          <Text style={styles.indicatorText}>Splash Active</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9999,
    alignItems: 'flex-end',
  },
  button: {
    backgroundColor: 'rgba(99, 102, 241, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  indicator: {
    marginTop: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  indicatorText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
