/**
 * Multiplayer Lobby Screen
 * Create or join multiplayer rooms
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMultiplayer } from '@/context/multiplayer-context';
import { PLAYER_EMOJIS } from '@/types/multiplayer';

const { width } = Dimensions.get('window');

export default function MultiplayerLobbyScreen() {
  const { createRoom, joinRoom, error, clearError } = useMultiplayer();
  
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [username, setUsername] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😎');
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);


  // Handle create room
  const handleCreateRoom = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }

    setIsLoading(true);
    try {
      const newRoomId = await createRoom(username.trim(), selectedEmoji);
      
      // Navigate to lobby with room details
      router.push({
        pathname: '/multiplayer-lobby',
        params: { roomId: newRoomId },
      });
    } catch (err) {
      Alert.alert('Error', error || 'Failed to create room');
      clearError();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle join room
  const handleJoinRoom = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }

    if (!roomId.trim()) {
      Alert.alert('Error', 'Please enter room code');
      return;
    }

    setIsLoading(true);
    try {
      await joinRoom(roomId.trim().toUpperCase(), username.trim(), selectedEmoji);
      
      // Navigate to lobby
      router.push({
        pathname: '/multiplayer-lobby',
        params: { roomId: roomId.trim().toUpperCase() },
      });
    } catch (err) {
      Alert.alert('Error', error || 'Failed to join room');
      clearError();
    } finally {
      setIsLoading(false);
    }
  };

  // Render main menu
  const renderMenu = () => (
    <View style={styles.menuContainer}>
      <Text style={styles.title}>Multiplayer</Text>
      <Text style={styles.subtitle}>Compete with friends in real-time</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => setMode('create')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus-circle" size={40} color="#6366f1" />
          <Text style={styles.modeButtonText}>Create Room</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => setMode('join')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="login" size={40} color="#6366f1" />
          <Text style={styles.modeButtonText}>Join Room</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="arrow-left" size={20} color="#888" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  // Render create room form
  const renderCreateForm = () => (
    <View style={styles.formContainer}>
      <TouchableOpacity
        style={styles.backIconButton}
        onPress={() => setMode('menu')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#888" />
      </TouchableOpacity>

      <Text style={styles.formTitle}>Create Room</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Your name"
          placeholderTextColor="#666"
          maxLength={20}
          autoCapitalize="none"
          autoFocus
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Avatar</Text>
        <TouchableOpacity
          style={styles.emojiButton}
          onPress={() => setShowEmojiPicker(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.selectedEmoji}>{selectedEmoji}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
        onPress={handleCreateRoom}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.actionButtonText}>Create Room</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Render join room form
  const renderJoinForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.backIconButton}
        onPress={() => setMode('menu')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#888" />
      </TouchableOpacity>

      <Text style={styles.formTitle}>Join Room</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Room Code</Text>
        <TextInput
          style={styles.input}
          value={roomId}
          onChangeText={(text) => setRoomId(text.toUpperCase())}
          placeholder="e.g., ABC123"
          placeholderTextColor="#666"
          maxLength={6}
          autoCapitalize="characters"
          autoFocus
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Your name"
          placeholderTextColor="#666"
          maxLength={20}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Avatar</Text>
        <TouchableOpacity
          style={styles.emojiButton}
          onPress={() => setShowEmojiPicker(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.selectedEmoji}>{selectedEmoji}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
        onPress={handleJoinRoom}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.actionButtonText}>Join Room</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // Render emoji picker modal
  const renderEmojiPicker = () => (
    <Modal
      visible={showEmojiPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowEmojiPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.emojiPickerContainer}>
          <Text style={styles.emojiPickerTitle}>Choose Your Emoji</Text>
          
          <ScrollView contentContainerStyle={styles.emojiGrid} showsVerticalScrollIndicator={false}>
            {PLAYER_EMOJIS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiOption,
                  selectedEmoji === emoji && styles.emojiOptionSelected,
                ]}
                onPress={() => {
                  setSelectedEmoji(emoji);
                  setShowEmojiPicker(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.emojiOptionText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setShowEmojiPicker(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {mode === 'menu' && renderMenu()}
      {mode === 'create' && renderCreateForm()}
      {mode === 'join' && renderJoinForm()}
      {renderEmojiPicker()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  modeButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  modeButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    paddingVertical: 12,
    gap: 8,
  },
  backButtonText: {
    fontSize: 15,
    color: '#888',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  backIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  emojiButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  selectedEmoji: {
    fontSize: 56,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
    height: 56,
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emojiPickerContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  emojiPickerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  emojiOption: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#0a0a0f',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  emojiOptionText: {
    fontSize: 36,
  },
  closeModalButton: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  closeModalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
