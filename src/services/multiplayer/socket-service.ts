/**
 * Socket.IO Service for Multiplayer
 * Handles real-time communication between players
 */
import { io, Socket } from 'socket.io-client';
import {
  MessageType,
  type SocketMessage,
  type MultiplayerRoom,
  type PlayerInfo,
  type RoomSettings,
  type GameProgress,
  type GameResult,
} from '@/types/multiplayer';

type MessageHandler = (message: SocketMessage) => void;

const BACKEND_URL = 'https://de4b-102-88-115-164.ngrok-free.app';

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private currentRoom: MultiplayerRoom | null = null;
  private isConnected = false;
  private progressQueue: GameProgress[] = [];
  private isSendingProgress = false;

  /**
   * Initialize socket connection
   */
  private initializeSocket(): void {
    if (this.socket) return;

    this.socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.setupSocketListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('room_update', ({ room }: { room: MultiplayerRoom }) => {
      console.log('Room update received:', room);
      this.currentRoom = room;
      this.notifyHandlers({
        type: MessageType.ROOM_UPDATE,
        data: { room },
        timestamp: Date.now(),
      });
    });

    this.socket.on('settings_updated', ({ settings }: { settings: RoomSettings }) => {
      console.log('Settings updated:', settings);
      if (this.currentRoom) {
        this.currentRoom.settings = settings;
      }
      this.notifyHandlers({
        type: MessageType.UPDATE_SETTINGS,
        data: { settings },
        timestamp: Date.now(),
      });
    });

    this.socket.on('game_starting', ({ roomId, settings }: { roomId: string; settings: RoomSettings | null }) => {
      console.log('Game starting:', roomId);
      if (this.currentRoom) {
        this.currentRoom.status = 'starting';
      }
      this.notifyHandlers({
        type: MessageType.START_GAME,
        data: { roomId, settings },
        timestamp: Date.now(),
      });
    });

    this.socket.on('game_started', () => {
      console.log('Game started');
      if (this.currentRoom) {
        this.currentRoom.status = 'playing';
      }
      this.notifyHandlers({
        type: MessageType.GAME_STARTED,
        data: {},
        timestamp: Date.now(),
      });
    });

    this.socket.on('player_progress', ({ playerId, progress }: { playerId: string; progress: GameProgress }) => {
      console.log('Player progress:', playerId, progress);
      this.notifyHandlers({
        type: MessageType.PROGRESS_UPDATE,
        data: { playerId, progress },
        timestamp: Date.now(),
      });
    });

    this.socket.on('game_finished', ({ result }: { result: GameResult }) => {
      console.log('Game finished:', result);
      if (this.currentRoom) {
        this.currentRoom.status = 'finished';
      }
      this.notifyHandlers({
        type: MessageType.GAME_FINISHED,
        data: { result },
        timestamp: Date.now(),
      });
    });

    this.socket.on('game_reset', () => {
      console.log('Game reset');
      if (this.currentRoom) {
        this.currentRoom.status = 'waiting';
      }
      this.notifyHandlers({
        type: MessageType.GAME_RESET,
        data: {},
        timestamp: Date.now(),
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  /**
   * Create a new room
   */
  async createRoom(hostPlayer: Omit<PlayerInfo, 'isHost' | 'isReady'>): Promise<string> {
    this.initializeSocket();

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('create_room', { playerInfo: hostPlayer }, (response: any) => {
        if (response.success) {
          this.currentRoom = response.room;
          console.log('Room created:', response.roomId);
          resolve(response.roomId);
        } else {
          reject(new Error(response.error || 'Failed to create room'));
        }
      });
    });
  }

  /**
   * Join an existing room
   */
  async joinRoom(
    roomId: string,
    playerInfo: Omit<PlayerInfo, 'isHost' | 'isReady'>
  ): Promise<void> {
    this.initializeSocket();

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      this.socket.emit('join_room', { roomId, playerInfo }, (response: any) => {
        if (response.success) {
          this.currentRoom = response.room;
          console.log('Joined room:', roomId);
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to join room'));
        }
      });
    });
  }

  /**
   * Disconnect from room
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.emit('leave_room');
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.currentRoom = null;
    this.isConnected = false;
    this.messageHandlers.clear();
    this.progressQueue = [];
    this.isSendingProgress = false;
  }

  /**
   * Set player ready status
   */
  setReady(isReady: boolean): void {
    if (this.socket) {
      this.socket.emit('set_ready', { isReady });
    }
  }

  /**
   * Update room settings (host only)
   */
  updateSettings(settings: RoomSettings): void {
    if (this.socket) {
      this.socket.emit('update_settings', { settings });
    }
  }

  /**
   * Start the game (host only)
   */
  startGame(): void {
    if (this.socket) {
      this.socket.emit('start_game');
    }
  }

  /**
   * Send progress update (non-blocking with queue and retry)
   */
  sendProgress(progress: GameProgress): void {
    // Add to queue immediately (never blocks)
    this.progressQueue.push(progress);
    
    // Process queue asynchronously
    this.processProgressQueue();
  }

  /**
   * Process progress queue in background with retry logic
   */
  private async processProgressQueue(): Promise<void> {
    // Prevent concurrent processing
    if (this.isSendingProgress || this.progressQueue.length === 0) {
      return;
    }

    this.isSendingProgress = true;

    // Use setTimeout to ensure this is truly async and non-blocking
    setTimeout(() => {
      try {
        if (!this.socket || !this.socket.connected) {
          // Socket not ready, will retry on next call
          this.isSendingProgress = false;
          return;
        }

        // Get latest progress (batch updates, only send most recent)
        const latestProgress = this.progressQueue[this.progressQueue.length - 1];
        this.progressQueue = []; // Clear queue

        // Emit without waiting for acknowledgment (fire and forget)
        this.socket.emit('progress_update', { progress: latestProgress });
        
        this.isSendingProgress = false;
      } catch (error) {
        console.log('Progress send failed, will retry:', error);
        this.isSendingProgress = false;
        // Items stay in queue for next attempt
      }
    }, 0);
  }

  /**
   * Announce game finished
   */
  finishGame(result: GameResult): void {
    if (this.socket) {
      this.socket.emit('game_finished', { result });
    }
  }

  /**
   * Request rematch (return to lobby)
   */
  requestRematch(): void {
    if (this.socket) {
      this.socket.emit('request_rematch');
    }
  }

  /**
   * Get current room
   */
  getCurrentRoom(): MultiplayerRoom | null {
    return this.currentRoom;
  }

  /**
   * Subscribe to messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  // Private methods

  private notifyHandlers(message: SocketMessage): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error: any) {
        console.error('Message Handler Error:', error);
      }
    });
  }
}

export const socketService = new SocketService();
