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
import { getLocalIpAddress, isConnectedToNetwork, getNetworkType } from '@/utils/network';

const { width } = Dimensions.get('window');

export default function MultiplayerLobbyScreen() {
  const { createRoom, joinRoom, error, clearError } = useMultiplayer();
  
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [username, setUsername] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😎');
  const [roomId, setRoomId] = useState('');
  const [serverHost, setServerHost] = useState('');
  const [serverPort, setServerPort] = useState('3000');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [localIp, setLocalIp] = useState<string | null>(null);
  const [networkConnected, setNetworkConnected] = useState(true);
  const [networkType, setNetworkType] = useState('unknown');

  // Check network status and get IP on mount
  useEffect(() => {
    const checkNetwork = async () => {
      const [connected, ip, type] = await Promise.all([
        isConnectedToNetwork(),
        getLocalIpAddress(),
        getNetworkType(),
      ]);
      
      setNetworkConnected(connected);
      setLocalIp(ip);
      setNetworkType(type);
      
      // Auto-populate server host with detected IP when in join mode
      if (ip && serverHost === '') {
        setServerHost(ip);
      }
    };
    
    checkNetwork();
  }, []);

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
      Alert.alert('Error', 'Please enter room ID');
      return;
    }

    if (!serverHost.trim()) {
      Alert.alert('Error', 'Please enter server host');
      return;
    }

    const port = parseInt(serverPort, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      Alert.alert('Error', 'Invalid port number');
      return;
    }

    setIsLoading(true);
    try {
      await joinRoom(roomId.trim().toUpperCase(), username.trim(), selectedEmoji, serverHost.trim(), port);
      
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
      <Text style={styles.subtitle}>Compete with friends in real-time!</Text>

      {/* Network Status */}
      <View style={styles.networkStatus}>
        <MaterialCommunityIcons 
          name={networkConnected ? "wifi" : "wifi-off"} 
          size={20} 
          color={networkConnected ? "#10b981" : "#ef4444"} 
        />
        <Text style={styles.networkStatusText}>
          {networkConnected 
            ? `Connected via ${networkType.toUpperCase()}${localIp ? ` • ${localIp}` : ''}`
            : 'No network connection'
          }
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => setMode('create')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus-circle" size={40} color="#ffffff" />
          <Text style={styles.modeButtonText}>Create Room</Text>
          <Text style={styles.modeButtonDesc}>Host a new game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => setMode('join')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="login" size={40} color="#ffffff" />
          <Text style={styles.modeButtonText}>Join Room</Text>
          <Text style={styles.modeButtonDesc}>Enter room code</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
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
        <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
      </TouchableOpacity>

      <Text style={styles.formTitle}>Create Room</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
          placeholderTextColor="#666"
          maxLength={20}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Choose Your Emoji</Text>
        <TouchableOpacity
          style={styles.emojiButton}
          onPress={() => setShowEmojiPicker(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.selectedEmoji}>{selectedEmoji}</Text>
          <Text style={styles.emojiButtonText}>Tap to change</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
        onPress={handleCreateRoom}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>
          {isLoading ? 'Creating...' : 'Create Room'}
        </Text>
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
        <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
      </TouchableOpacity>

      <Text style={styles.formTitle}>Join Room</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Room ID</Text>
        <TextInput
          style={styles.input}
          value={roomId}
          onChangeText={(text) => setRoomId(text.toUpperCase())}
          placeholder="Enter 6-digit room code"
          placeholderTextColor="#666"
          maxLength={6}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
          placeholderTextColor="#666"
          maxLength={20}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Choose Your Emoji</Text>
        <TouchableOpacity
          style={styles.emojiButton}
          onPress={() => setShowEmojiPicker(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.selectedEmoji}>{selectedEmoji}</Text>
          <Text style={styles.emojiButtonText}>Tap to change</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Server Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Host IP Address</Text>
        <View style={styles.inputWithButton}>
          <TextInput
            style={[styles.input, styles.inputWithAction]}
            value={serverHost}
            onChangeText={setServerHost}
            placeholder={localIp || "e.g., 192.168.1.1"}
            placeholderTextColor="#666"
            autoCapitalize="none"
            keyboardType="decimal-pad"
          />
          {localIp && (
            <TouchableOpacity
              style={styles.autoFillButton}
              onPress={() => setServerHost(localIp)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="autorenew" size={20} color="#6366f1" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.helpText}>
          Ask the host for their IP address shown in the lobby
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Port</Text>
        <TextInput
          style={styles.input}
          value={serverPort}
          onChangeText={setServerPort}
          placeholder="e.g., 3000"
          placeholderTextColor="#666"
          keyboardType="number-pad"
          maxLength={5}
        />
      </View>

      <TouchableOpacity
        style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
        onPress={handleJoinRoom}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>
          {isLoading ? 'Joining...' : 'Join Room'}
        </Text>
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
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  networkStatusText: {
    fontSize: 13,
    color: '#aaa',
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  modeButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  modeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
  },
  modeButtonDesc: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 8,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backIconButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#333',
  },
  inputWithButton: {
    position: 'relative',
  },
  inputWithAction: {
    paddingRight: 48,
  },
  autoFillButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 8,
    backgroundColor: '#2d2d44',
    borderRadius: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  emojiButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emojiButtonText: {
    fontSize: 14,
    color: '#888',
  },
  actionButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPickerContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    width: width - 48,
    maxHeight: '80%',
  },
  emojiPickerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  emojiOption: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#0a0a0f',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#6366f1',
  },
  emojiOptionText: {
    fontSize: 32,
  },
  closeModalButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  closeModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
