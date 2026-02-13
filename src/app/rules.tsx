/**
 * Rules/Instructions Screen
 * Displays game rules and instructions for all puzzle types
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSplashContext } from '@/context/splash-context';

export default function RulesScreen() {
  const router = useRouter();
  const { dismissSplash } = useSplashContext();

  const handlePlayPress = async () => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Don't initialize here - let tutorial handle it for first-time users
    // or main screen will initialize for returning users
    dismissSplash();
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How to Play</Text>
          <Text style={styles.subtitle}>Quick Guide to Lusus Puzzles</Text>
        </View>

        {/* Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.text}>
            Lusus is a collection of micro puzzles designed to challenge your cognitive abilities. 
            Each puzzle type tests different mental skills like memory, pattern recognition, and visual processing.
          </Text>
          <Text style={[styles.text, { marginTop: 12, fontStyle: 'italic', color: '#b0b0ba' }]}>
            💡 First-time players will see a guided tutorial when they start playing. 
            You can access it anytime by tapping the help icon (?) at the top of the screen.
          </Text>
        </View>

        {/* Puzzle Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Puzzle Types</Text>

          <View style={styles.puzzleType}>
            <Text style={styles.puzzleIcon}>🧩</Text>
            <View style={styles.puzzleContent}>
              <Text style={styles.puzzleName}>Reverse Memory</Text>
              <Text style={styles.puzzleDescription}>
                Memorize the shapes shown, then tap a shape that was NOT in the list before the timer runs out. 
                Tests your working memory and attention to detail.
              </Text>
            </View>
          </View>

          <View style={styles.puzzleType}>
            <Text style={styles.puzzleIcon}>🔍</Text>
            <View style={styles.puzzleContent}>
              <Text style={styles.puzzleName}>Find the Oddity</Text>
              <Text style={styles.puzzleDescription}>
                Spot the different shape among similar ones. 
                Challenges your visual discrimination and attention to detail.
              </Text>
            </View>
          </View>

          <View style={styles.puzzleType}>
            <Text style={styles.puzzleIcon}>🎯</Text>
            <View style={styles.puzzleContent}>
              <Text style={styles.puzzleName}>More Coming Soon</Text>
              <Text style={styles.puzzleDescription}>
                New puzzle types will be added regularly to keep your brain engaged!
              </Text>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              You start with a 4-second timer that increases by 1 second for every 5-streak milestone you reach
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Pay attention during the memorization phase
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              The difficulty adapts to your performance
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Swipe to get a new puzzle if you want to skip
            </Text>
          </View>
        </View>

        {/* Scoring Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scoring</Text>
          <Text style={styles.text}>
            Earn points for correct answers. Accuracy and difficulty level affect your score. 
            Build streaks for bonus points and watch the difficulty increase as you improve!
          </Text>
        </View>

        {/* Spacing at bottom */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Play Button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handlePlayPress}
          style={({ pressed }) => [
            styles.playButton,
            pressed && styles.playButtonPressed,
          ]}
        >
          <Text style={styles.playButtonText}>Start Playing</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8b8b9a',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#d0d0da',
    fontWeight: '400',
  },
  puzzleType: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#1a1a24',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a34',
  },
  puzzleIcon: {
    fontSize: 32,
    marginRight: 16,
    marginTop: 4,
  },
  puzzleContent: {
    flex: 1,
  },
  puzzleName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  puzzleDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#b0b0ba',
    fontWeight: '400',
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 8,
  },
  tipBullet: {
    fontSize: 20,
    color: '#6366f1',
    marginRight: 12,
    marginTop: -2,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#d0d0da',
    fontWeight: '400',
  },
  bottomSpacer: {
    height: 100,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#0a0a0f',
    borderTopWidth: 1,
    borderTopColor: '#1a1a24',
  },
  playButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  playButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
});
