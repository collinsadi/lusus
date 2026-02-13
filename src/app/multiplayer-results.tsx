/**
 * Multiplayer Results Screen
 * Shows winner and shareable victory card
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMultiplayer } from '@/context/multiplayer-context';
import { captureRef } from 'react-native-view-shot';
import { socketService } from '@/services/multiplayer/socket-service';

export default function MultiplayerResultsScreen() {
  const { gameResult, localPlayer, leaveRoom, resetGame, currentRoom } = useMultiplayer();
  const victoryCardRef = useRef<View>(null);

  // Navigate back to lobby if game is reset
  useEffect(() => {
    if (!gameResult && currentRoom) {
      router.replace('/multiplayer-lobby');
    }
  }, [gameResult, currentRoom]);

  if (!gameResult || !localPlayer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isWinner = gameResult.winnerId === localPlayer.id;
  const winner = gameResult.allPlayers.find((p) => p.playerId === gameResult.winnerId);

  // Sort players by streak
  const sortedPlayers = [...gameResult.allPlayers].sort(
    (a, b) => b.finalStreak - a.finalStreak
  );

  // Handle share
  const handleShare = async () => {
    try {
      // In a production app, you'd capture the card as an image
      // and share it. For now, we'll share text.
      const message = isWinner
        ? `🏆 I won a Lusus multiplayer match with a ${gameResult.finalStreak} streak! Can you beat that?`
        : `I played a Lusus multiplayer match! The winner got a ${gameResult.finalStreak} streak. Join me next time!`;

      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Handle exit
  const handleExit = () => {
    leaveRoom();
    router.replace('/(tabs)');
  };

  // Handle rematch
  const handleRematch = () => {
    if (!currentRoom) return;
    
    // Request rematch via socket (server will broadcast to all players)
    socketService.requestRematch();
    resetGame();
    
    // Navigate back to lobby
    router.replace('/multiplayer-lobby');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Victory Card */}
        <View ref={victoryCardRef} collapsable={false}>
          <LinearGradient
            colors={isWinner ? ['#6366f1', '#8b5cf6', '#d946ef'] : ['#1a1a2e', '#2d2d44']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.victoryCard}
          >
            {isWinner && (
              <View style={styles.confettiContainer}>
                <Text style={styles.confetti}>🎉</Text>
                <Text style={styles.confetti}>🎊</Text>
                <Text style={styles.confetti}>✨</Text>
                <Text style={styles.confetti}>🏆</Text>
              </View>
            )}

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {isWinner ? 'Victory!' : 'Game Over'}
              </Text>
              {isWinner && (
                <MaterialCommunityIcons name="trophy" size={40} color="#fbbf24" />
              )}
            </View>

            <View style={styles.winnerSection}>
              <Text style={styles.winnerEmoji}>{gameResult.winnerEmoji}</Text>
              <Text style={styles.winnerName}>{gameResult.winnerUsername}</Text>
              <View style={styles.winnerStats}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="fire" size={24} color="#ffffff" />
                  <Text style={styles.statValue}>{gameResult.finalStreak}</Text>
                  <Text style={styles.statLabel}>Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="timer" size={24} color="#ffffff" />
                  <Text style={styles.statValue}>
                    {(gameResult.completionTime / 1000).toFixed(1)}s
                  </Text>
                  <Text style={styles.statLabel}>Time</Text>
                </View>
              </View>
            </View>

            {isWinner && (
              <View style={styles.winnerBadge}>
                <MaterialCommunityIcons name="crown" size={20} color="#fbbf24" />
                <Text style={styles.winnerBadgeText}>Champion</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>Final Standings</Text>
          
          {sortedPlayers.map((player, index) => {
            const isLocal = player.playerId === localPlayer.id;
            const isTopThree = index < 3;
            
            return (
              <View
                key={player.playerId}
                style={[
                  styles.playerRow,
                  isLocal && styles.playerRowActive,
                  index === 0 && styles.playerRowFirst,
                ]}
              >
                <View style={styles.rankContainer}>
                  {index === 0 && (
                    <MaterialCommunityIcons name="trophy" size={24} color="#fbbf24" />
                  )}
                  {index === 1 && (
                    <MaterialCommunityIcons name="medal" size={24} color="#c0c0c0" />
                  )}
                  {index === 2 && (
                    <MaterialCommunityIcons name="medal" size={24} color="#cd7f32" />
                  )}
                  {index > 2 && (
                    <Text style={styles.rankText}>{index + 1}</Text>
                  )}
                </View>
                
                <Text style={styles.playerRowEmoji}>{player.emoji}</Text>
                
                <View style={styles.playerRowInfo}>
                  <Text style={styles.playerRowName} numberOfLines={1}>
                    {player.username}
                    {isLocal && ' (You)'}
                  </Text>
                  <View style={styles.playerRowStats}>
                    <MaterialCommunityIcons name="fire" size={16} color="#6366f1" />
                    <Text style={styles.playerRowStreak}>{player.finalStreak}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="share-variant" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.rematchButton]}
          onPress={handleRematch}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="refresh" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>Rematch</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.exitButton]}
          onPress={handleExit}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="home" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>Exit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
  },
  scrollContent: {
    padding: 20,
  },
  victoryCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
  },
  confetti: {
    fontSize: 32,
    opacity: 0.3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  cardTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  winnerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  winnerEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  winnerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  winnerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  winnerBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginLeft: 8,
  },
  leaderboardSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerRowActive: {
    borderColor: '#6366f1',
  },
  playerRowFirst: {
    backgroundColor: '#2d2d44',
    borderColor: '#fbbf24',
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
  playerRowEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  playerRowInfo: {
    flex: 1,
  },
  playerRowName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  playerRowStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerRowStreak: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  rematchButton: {
    backgroundColor: '#10b981',
  },
  exitButton: {
    backgroundColor: '#1a1a2e',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
