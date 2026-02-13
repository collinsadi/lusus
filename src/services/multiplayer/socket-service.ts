/**
 * TCP Socket Service for Multiplayer
 * Handles real-time communication between players
 */
import TcpSocket from 'react-native-tcp-socket';
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
type Socket = ReturnType<typeof TcpSocket.createConnection>;

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private isConnecting = false;

  // For demo purposes, we'll simulate a server
  // In production, you'd connect to a real server
  private isServer = false;
  private serverSocket: any = null;
  private connectedClients: Map<string, Socket> = new Map();
  private currentRoom: MultiplayerRoom | null = null;

  /**
   * Create a new room (act as server)
   */
  async createRoom(hostPlayer: Omit<PlayerInfo, 'isHost' | 'isReady'>): Promise<string> {
    const roomId = this.generateRoomId();
    
    // Initialize room
    this.currentRoom = {
      id: roomId,
      hostId: hostPlayer.id,
      players: [{
        ...hostPlayer,
        isHost: true,
        isReady: false,
      }],
      settings: null,
      status: 'waiting',
      createdAt: Date.now(),
    };

    this.isServer = true;
    
    // In a real implementation, start a TCP server
    // For now, we'll simulate local room management
    console.log('Room created:', roomId);
    
    return roomId;
  }

  /**
   * Join an existing room
   */
  async joinRoom(
    roomId: string,
    playerInfo: Omit<PlayerInfo, 'isHost' | 'isReady'>,
    host: string,
    port: number
  ): Promise<void> {
    if (this.socket) {
      this.disconnect();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        // Create TCP socket connection
        this.socket = TcpSocket.createConnection(
          {
            host,
            port,
            reuseAddress: true,
          },
          () => {
            console.log('Connected to room:', roomId);
            this.isConnecting = false;
            this.reconnectAttempts = 0;

            // Send join message
            this.sendMessage({
              type: MessageType.JOIN_ROOM,
              data: { roomId, playerInfo },
              timestamp: Date.now(),
            });

            resolve();
          }
        );

        // Handle incoming data
        this.socket.on('data', (data: any) => {
          try {
            const message: SocketMessage = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        });

        // Handle errors
        this.socket.on('error', (error: any) => {
          console.error('Socket error:', error);
          this.isConnecting = false;
          
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect(roomId, playerInfo, host, port);
          } else {
            reject(error);
          }
        });

        // Handle disconnection
        this.socket.on('close', () => {
          console.log('Socket closed');
          this.isConnecting = false;
          
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect(roomId, playerInfo, host, port);
          }
        });

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from room
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    
    if (this.serverSocket) {
      this.serverSocket.close();
      this.serverSocket = null;
    }
    
    this.connectedClients.clear();
    this.currentRoom = null;
    this.isServer = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Set player ready status
   */
  setReady(isReady: boolean): void {
    this.sendMessage({
      type: MessageType.SET_READY,
      data: { isReady },
      timestamp: Date.now(),
    });
  }

  /**
   * Update room settings (host only)
   */
  updateSettings(settings: RoomSettings): void {
    if (this.isServer && this.currentRoom) {
      this.currentRoom.settings = settings;
      
      this.broadcastMessage({
        type: MessageType.UPDATE_SETTINGS,
        data: { settings },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Start the game (host only)
   */
  startGame(): void {
    if (this.isServer && this.currentRoom) {
      this.currentRoom.status = 'starting';
      
      this.broadcastMessage({
        type: MessageType.START_GAME,
        data: { 
          roomId: this.currentRoom.id,
          settings: this.currentRoom.settings,
        },
        timestamp: Date.now(),
      });

      // Move to playing state
      setTimeout(() => {
        if (this.currentRoom) {
          this.currentRoom.status = 'playing';
          this.broadcastMessage({
            type: MessageType.GAME_STARTED,
            data: {},
            timestamp: Date.now(),
          });
        }
      }, 3000);
    }
  }

  /**
   * Send progress update
   */
  sendProgress(progress: GameProgress): void {
    this.sendMessage({
      type: MessageType.PROGRESS_UPDATE,
      data: { progress },
      timestamp: Date.now(),
    });
  }

  /**
   * Announce game finished
   */
  finishGame(result: GameResult): void {
    if (this.isServer) {
      this.broadcastMessage({
        type: MessageType.GAME_FINISHED,
        data: { result },
        timestamp: Date.now(),
      });
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

  private sendMessage(message: SocketMessage): void {
    if (this.socket) {
      const data = JSON.stringify(message);
      this.socket.write(data);
    } else if (this.isServer) {
      // If we're the server, broadcast to clients
      this.broadcastMessage(message);
    }
  }

  private broadcastMessage(message: SocketMessage): void {
    if (this.isServer) {
      const data = JSON.stringify(message);
      this.connectedClients.forEach((client) => {
        try {
          client.write(data);
        } catch (error) {
          console.error('Failed to send to client:', error);
        }
      });
      
      // Also notify local handlers
      this.handleMessage(message);
    }
  }

  private handleMessage(message: SocketMessage): void {
    console.log('Received message:', message.type);
    
    // Process message based on type
    switch (message.type) {
      case MessageType.JOIN_ROOM:
        this.handlePlayerJoin(message);
        break;
        
      case MessageType.PLAYER_LEFT:
        this.handlePlayerLeft(message);
        break;
        
      case MessageType.SET_READY:
        this.handleSetReady(message);
        break;
        
      case MessageType.UPDATE_SETTINGS:
        if (!this.isServer) {
          // Update local room settings
          if (this.currentRoom) {
            this.currentRoom.settings = message.data.settings;
          }
        }
        break;
    }
    
    // Notify all handlers
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('Message handler error:', error);
      }
    });
  }

  private handlePlayerJoin(message: SocketMessage): void {
    if (this.isServer && this.currentRoom) {
      const { playerInfo } = message.data;
      
      // Add player to room
      this.currentRoom.players.push({
        ...playerInfo,
        isHost: false,
        isReady: false,
      });
      
      // Broadcast room update
      this.broadcastMessage({
        type: MessageType.ROOM_UPDATE,
        data: { room: this.currentRoom },
        timestamp: Date.now(),
      });
    }
  }

  private handlePlayerLeft(message: SocketMessage): void {
    if (this.isServer && this.currentRoom) {
      const { playerId } = message.data;
      
      this.currentRoom.players = this.currentRoom.players.filter(
        (p) => p.id !== playerId
      );
      
      // Broadcast room update
      this.broadcastMessage({
        type: MessageType.ROOM_UPDATE,
        data: { room: this.currentRoom },
        timestamp: Date.now(),
      });
    }
  }

  private handleSetReady(message: SocketMessage): void {
    if (this.isServer && this.currentRoom) {
      const { isReady } = message.data;
      const playerId = message.senderId;
      
      const player = this.currentRoom.players.find((p) => p.id === playerId);
      if (player) {
        player.isReady = isReady;
        
        // Broadcast room update
        this.broadcastMessage({
          type: MessageType.ROOM_UPDATE,
          data: { room: this.currentRoom },
          timestamp: Date.now(),
        });
      }
    }
  }

  private attemptReconnect(
    roomId: string,
    playerInfo: Omit<PlayerInfo, 'isHost' | 'isReady'>,
    host: string,
    port: number
  ): void {
    this.reconnectAttempts++;
    console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      this.joinRoom(roomId, playerInfo, host, port).catch(console.error);
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private generateRoomId(): string {
    // Generate a 6-character room ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const socketService = new SocketService();
