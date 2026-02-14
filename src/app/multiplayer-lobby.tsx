/**
 * Multiplayer Lobby - Waiting Room
 * Players wait here before the game starts
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMultiplayer } from '@/context/multiplayer-context';
import type { RoomSettings } from '@/types/multiplayer';

const { width } = Dimensions.get('window');

export default function MultiplayerLobbyScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const {
    isHost,
    currentRoom,
    localPlayer,
    gameInProgress,
    leaveRoom,
    setReady,
    updateSettings,
    startGame,
  } = useMultiplayer();

  const [targetStreak, setTargetStreak] = useState(10);
  const [timeLimit, setTimeLimit] = useState(120); // 2 minutes

  // Navigate to game when started
  useEffect(() => {
    if (gameInProgress) {
      router.replace('/multiplayer-game');
    }
  }, [gameInProgress]);

  // Handle leave room
  const handleLeaveRoom = () => {
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveRoom();
            router.back();
          },
        },
      ]
    );
  };

  // Handle ready toggle
  const handleToggleReady = () => {
    if (localPlayer) {
      setReady(!localPlayer.isReady);
    }
  };

  // Handle settings change
  const handleUpdateSettings = () => {
    const settings: RoomSettings = {
      targetStreak,
      timeLimit,
    };
    updateSettings(settings);
  };

  // Handle start game
  const handleStartGame = () => {
    if (!currentRoom?.settings) {
      Alert.alert('Error', 'Please set game settings first');
      return;
    }

    const allReady = currentRoom.players.every((p) => p.isHost || p.isReady);
    if (!allReady) {
      Alert.alert('Not Ready', 'Wait for all players to be ready');
      return;
    }

    if (currentRoom.players.length < 2) {
      Alert.alert('Not Enough Players', 'Need at least 2 players to start');
      return;
    }

    startGame();
  };

  // Share room code
  const handleShareRoom = async () => {
    try {
      const shareMessage = `Join my Lusus multiplayer game! Room Code: ${roomId}`;
      
      await Share.share({
        message: shareMessage,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Update settings on change
  useEffect(() => {
    if (isHost) {
      handleUpdateSettings();
    }
  }, [targetStreak, timeLimit, isHost]);

  if (!currentRoom || !localPlayer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Loading room...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleLeaveRoom}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.roomCodeContainer}>
          <Text style={styles.roomCodeLabel}>Room Code</Text>
          <Text style={styles.roomCode}>{roomId}</Text>
        </View>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareRoom}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="share-variant" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Players List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Players ({currentRoom.players.length})
          </Text>
          
          {currentRoom.players.map((player) => (
            <View key={player.id} style={styles.playerCard}>
              <Text style={styles.playerEmoji}>{player.emoji}</Text>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.username}</Text>
                {player.isHost && (
                  <View style={styles.hostBadge}>
                    <MaterialCommunityIcons name="crown" size={16} color="#fbbf24" />
                    <Text style={styles.hostBadgeText}>Host</Text>
                  </View>
                )}
              </View>
              <View style={styles.playerStatus}>
                {player.isReady ? (
                  <>
                    <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
                    <Text style={styles.readyText}>Ready</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="clock-outline" size={24} color="#888" />
                    <Text style={styles.notReadyText}>Not Ready</Text>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Game Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Settings</Text>
          
          {isHost ? (
            <>
              <View style={styles.settingCard}>
                <View style={styles.settingHeader}>
                  <MaterialCommunityIcons name="target" size={24} color="#6366f1" />
                  <Text style={styles.settingLabel}>Target Streak</Text>
                </View>
                <View style={styles.settingControls}>
                  <TouchableOpacity
                    style={styles.settingButton}
                    onPress={() => setTargetStreak(Math.max(5, targetStreak - 5))}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="minus" size={24} color="#ffffff" />
                  </TouchableOpacity>
                  <Text style={styles.settingValue}>{targetStreak}</Text>
                  <TouchableOpacity
                    style={styles.settingButton}
                    onPress={() => setTargetStreak(Math.min(50, targetStreak + 5))}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.settingCard}>
                <View style={styles.settingHeader}>
                  <MaterialCommunityIcons name="timer-outline" size={24} color="#6366f1" />
                  <Text style={styles.settingLabel}>Time Limit</Text>
                </View>
                <View style={styles.settingControls}>
                  <TouchableOpacity
                    style={styles.settingButton}
                    onPress={() => setTimeLimit(Math.max(30, timeLimit - 30))}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="minus" size={24} color="#ffffff" />
                  </TouchableOpacity>
                  <Text style={styles.settingValue}>{timeLimit}s</Text>
                  <TouchableOpacity
                    style={styles.settingButton}
                    onPress={() => setTimeLimit(Math.min(600, timeLimit + 30))}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.settingsDisplay}>
              {currentRoom.settings ? (
                <>
                  <View style={styles.settingDisplayItem}>
                    <MaterialCommunityIcons name="target" size={24} color="#6366f1" />
                    <Text style={styles.settingDisplayText}>
                      Target Streak: {currentRoom.settings.targetStreak}
                    </Text>
                  </View>
                  <View style={styles.settingDisplayItem}>
                    <MaterialCommunityIcons name="timer-outline" size={24} color="#6366f1" />
                    <Text style={styles.settingDisplayText}>
                      Time Limit: {currentRoom.settings.timeLimit}s
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.waitingText}>Waiting for host to set settings...</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {isHost ? (
          <TouchableOpacity
            style={[
              styles.startButton,
              (!currentRoom.settings || currentRoom.players.length < 2) && styles.startButtonDisabled,
            ]}
            onPress={handleStartGame}
            disabled={!currentRoom.settings || currentRoom.players.length < 2}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="play" size={24} color="#ffffff" />
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.readyButton,
              localPlayer.isReady && styles.readyButtonActive,
            ]}
            onPress={handleToggleReady}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={localPlayer.isReady ? 'check-circle' : 'clock-outline'}
              size={24}
              color="#ffffff"
            />
            <Text style={styles.readyButtonText}>
              {localPlayer.isReady ? 'Ready!' : 'Mark as Ready'}
            </Text>
          </TouchableOpacity>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
  },
  roomCodeContainer: {
    alignItems: 'center',
  },
  roomCodeLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  roomCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  shareButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  playerEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  hostBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0a0a0f',
    marginLeft: 4,
  },
  playerStatus: {
    alignItems: 'center',
  },
  readyText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
  },
  notReadyText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  settingCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
  },
  settingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 24,
  },
  settingValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  settingsDisplay: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
  },
  settingDisplayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingDisplayText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  waitingText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  bottomActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 18,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  readyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 18,
  },
  readyButtonActive: {
    backgroundColor: '#10b981',
  },
  readyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#888',
  },
});
