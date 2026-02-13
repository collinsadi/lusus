/**
 * Multiplayer type definitions for TCP socket-based gameplay
 */

export interface PlayerInfo {
  id: string;
  username: string;
  emoji: string;
  isHost: boolean;
  isReady: boolean;
}

export interface MultiplayerRoom {
  id: string;
  hostId: string;
  players: PlayerInfo[];
  settings: RoomSettings | null;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  createdAt: number;
}

export interface RoomSettings {
  targetStreak: number; // Target streak to win
  timeLimit: number; // Time limit in seconds
}

export interface GameProgress {
  playerId: string;
  currentStreak: number;
  totalPuzzles: number;
  successCount: number;
  failureCount: number;
  lastUpdateTime: number;
}

export interface GameResult {
  winnerId: string;
  winnerUsername: string;
  winnerEmoji: string;
  finalStreak: number;
  completionTime: number;
  allPlayers: Array<{
    playerId: string;
    username: string;
    emoji: string;
    finalStreak: number;
  }>;
}

export enum MessageType {
  // Connection
  JOIN_ROOM = 'JOIN_ROOM',
  PLAYER_JOINED = 'PLAYER_JOINED',
  PLAYER_LEFT = 'PLAYER_LEFT',
  ROOM_UPDATE = 'ROOM_UPDATE',
  
  // Lobby
  SET_READY = 'SET_READY',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  START_GAME = 'START_GAME',
  
  // Game
  GAME_STARTED = 'GAME_STARTED',
  PROGRESS_UPDATE = 'PROGRESS_UPDATE',
  GAME_FINISHED = 'GAME_FINISHED',
  
  // Errors
  ERROR = 'ERROR',
}

export interface SocketMessage {
  type: MessageType;
  data: any;
  timestamp: number;
  senderId?: string;
}

// Specific message payloads
export interface JoinRoomMessage {
  roomId: string;
  playerInfo: Omit<PlayerInfo, 'isHost' | 'isReady'>;
}

export interface UpdateSettingsMessage {
  settings: RoomSettings;
}

export interface ProgressUpdateMessage {
  progress: GameProgress;
}

export interface ErrorMessage {
  message: string;
  code?: string;
}

// Available emojis for player selection
export const PLAYER_EMOJIS = [
  '😀', '😎', '🤓', '😺', '🦊', '🐶', '🐼', '🦁',
  '🐨', '🐸', '🦄', '🐙', '🦋', '🌟', '🔥', '⚡',
  '🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🚀', '🌈'
];
