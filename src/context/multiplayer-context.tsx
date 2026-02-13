/**
 * Multiplayer Context
 * Manages multiplayer game state and socket communication
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  MessageType,
  type PlayerInfo,
  type MultiplayerRoom,
  type RoomSettings,
  type GameProgress,
  type GameResult,
  type SocketMessage,
} from '@/types/multiplayer';
import { socketService } from '@/services/multiplayer/socket-service';
import type { SessionStats } from '@/types/puzzle';

interface MultiplayerContextValue {
  // Connection state
  isConnected: boolean;
  isHost: boolean;
  currentRoom: MultiplayerRoom | null;
  
  // Player info
  localPlayer: PlayerInfo | null;
  
  // Game state
  gameInProgress: boolean;
  gameStartTime: number | null;
  gameProgress: Map<string, GameProgress>;
  gameResult: GameResult | null;
  
  // Actions
  createRoom: (username: string, emoji: string) => Promise<string>;
  joinRoom: (roomId: string, username: string, emoji: string) => Promise<void>;
  leaveRoom: () => void;
  setReady: (isReady: boolean) => void;
  updateSettings: (settings: RoomSettings) => void;
  startGame: () => void;
  updateProgress: (stats: SessionStats) => void;
  resetGame: () => void;
  
  // Error state
  error: string | null;
  clearError: () => void;
}

const MultiplayerContext = createContext<MultiplayerContextValue | undefined>(undefined);

interface MultiplayerProviderProps {
  children: React.ReactNode;
}

export const MultiplayerProvider: React.FC<MultiplayerProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<MultiplayerRoom | null>(null);
  const [localPlayer, setLocalPlayer] = useState<PlayerInfo | null>(null);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [gameProgress, setGameProgress] = useState<Map<string, GameProgress>>(new Map());
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const gameCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate unique player ID
  const generatePlayerId = useCallback(() => {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Create a new room
  const createRoom = useCallback(async (username: string, emoji: string): Promise<string> => {
    try {
      setError(null);
      const playerId = generatePlayerId();
      
      const roomId = await socketService.createRoom({
        id: playerId,
        username,
        emoji,
      });
      
      const player: PlayerInfo = {
        id: playerId,
        username,
        emoji,
        isHost: true,
        isReady: false,
      };
      
      setLocalPlayer(player);
      setIsHost(true);
      setIsConnected(true);
      
      return roomId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create room';
      setError(message);
      throw err;
    }
  }, [generatePlayerId]);

  // Join an existing room
  const joinRoom = useCallback(
    async (roomId: string, username: string, emoji: string): Promise<void> => {
      try {
        setError(null);
        const playerId = generatePlayerId();
        
        await socketService.joinRoom(
          roomId,
          { id: playerId, username, emoji }
        );
        
        const player: PlayerInfo = {
          id: playerId,
          username,
          emoji,
          isHost: false,
          isReady: false,
        };
        
        setLocalPlayer(player);
        setIsHost(false);
        setIsConnected(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to join room';
        setError(message);
        throw err;
      }
    },
    [generatePlayerId]
  );

  // Leave the current room
  const leaveRoom = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setIsHost(false);
    setCurrentRoom(null);
    setLocalPlayer(null);
    setGameInProgress(false);
    setGameStartTime(null);
    setGameProgress(new Map());
    setGameResult(null);
    
    if (gameCheckIntervalRef.current) {
      clearInterval(gameCheckIntervalRef.current);
      gameCheckIntervalRef.current = null;
    }
  }, []);

  // Set ready status
  const setReady = useCallback((isReady: boolean) => {
    socketService.setReady(isReady);
    
    if (localPlayer) {
      setLocalPlayer({ ...localPlayer, isReady });
    }
  }, [localPlayer]);

  // Update room settings (host only)
  const updateSettings = useCallback((settings: RoomSettings) => {
    if (!isHost) return;
    socketService.updateSettings(settings);
  }, [isHost]);

  // Start the game (host only)
  const startGame = useCallback(() => {
    if (!isHost || !currentRoom?.settings) return;
    socketService.startGame();
  }, [isHost, currentRoom]);

  // Handle timeout (called by host when time runs out)
  const handleTimeout = useCallback(() => {
    if (!currentRoom || !gameStartTime || !isHost) return;
    
    // Determine winner based on highest streak
    const progressArray = Array.from(gameProgress.entries());
    
    if (progressArray.length === 0) {
      console.log('No progress data available for timeout');
      return;
    }
    
    // Sort by highest streak, then by who updated last (earlier is better)
    progressArray.sort((a, b) => {
      if (b[1].currentStreak !== a[1].currentStreak) {
        return b[1].currentStreak - a[1].currentStreak;
      }
      return a[1].lastUpdateTime - b[1].lastUpdateTime;
    });
    
    const [winnerId, winnerProgress] = progressArray[0];
    const winner = currentRoom.players.find(p => p.id === winnerId);
    
    if (!winner) {
      console.log('Winner not found in room players');
      return;
    }
    
    const timeLimit = (currentRoom.settings?.timeLimit || 60) * 1000;
    const result: GameResult = {
      winnerId: winner.id,
      winnerUsername: winner.username,
      winnerEmoji: winner.emoji,
      finalStreak: winnerProgress.currentStreak,
      completionTime: timeLimit,
      allPlayers: currentRoom.players.map(p => {
        const progress = gameProgress.get(p.id);
        return {
          playerId: p.id,
          username: p.username,
          emoji: p.emoji,
          finalStreak: progress?.currentStreak || 0,
        };
      }),
    };
    
    console.log('Time limit reached. Winner:', winner.username, 'with streak:', winnerProgress.currentStreak);
    
    // End game locally
    setGameResult(result);
    setGameInProgress(false);
    
    // Clear interval if exists
    if (gameCheckIntervalRef.current) {
      clearInterval(gameCheckIntervalRef.current);
      gameCheckIntervalRef.current = null;
    }
    
    // Emit to server to broadcast to all players
    socketService.finishGame(result);
  }, [currentRoom, gameStartTime, gameProgress, isHost]);

  // Check if game is complete (called by any player who reaches target)
  const checkGameCompletion = useCallback((stats: SessionStats) => {
    if (!currentRoom || !localPlayer || !gameStartTime) return;
    
    const settings = currentRoom.settings;
    if (!settings) return;
    
    // Only proceed if local player reached target
    if (stats.currentStreak < settings.targetStreak) return;
    
    // Find all players who reached target
    const winners = Array.from(gameProgress.entries())
      .filter(([_, progress]) => progress.currentStreak >= settings.targetStreak)
      .map(([playerId, progress]) => {
        const player = currentRoom.players.find(p => p.id === playerId);
        return {
          playerId,
          username: player?.username || 'Unknown',
          emoji: player?.emoji || '👤',
          finalStreak: progress.currentStreak,
          completionTime: progress.lastUpdateTime - gameStartTime,
        };
      });
    
    // Add current player if they won
    const alreadyIncluded = winners.some(w => w.playerId === localPlayer.id);
    if (!alreadyIncluded) {
      winners.push({
        playerId: localPlayer.id,
        username: localPlayer.username,
        emoji: localPlayer.emoji,
        finalStreak: stats.currentStreak,
        completionTime: Date.now() - gameStartTime,
      });
    }
    
    // Sort by completion time (fastest wins)
    winners.sort((a, b) => a.completionTime - b.completionTime);
    const winner = winners[0];
    
    const result: GameResult = {
      winnerId: winner.playerId,
      winnerUsername: winner.username,
      winnerEmoji: winner.emoji,
      finalStreak: winner.finalStreak,
      completionTime: winner.completionTime,
      allPlayers: currentRoom.players.map(p => {
        const progress = gameProgress.get(p.id);
        return {
          playerId: p.id,
          username: p.username,
          emoji: p.emoji,
          finalStreak: progress?.currentStreak || 0,
        };
      }),
    };
    
    // Send game finished event (server will broadcast to all players)
    socketService.finishGame(result);
    setGameResult(result);
    setGameInProgress(false);
    
    if (gameCheckIntervalRef.current) {
      clearInterval(gameCheckIntervalRef.current);
      gameCheckIntervalRef.current = null;
    }
  }, [currentRoom, localPlayer, gameStartTime, gameProgress]);

  // Update player progress
  const updateProgress = useCallback((stats: SessionStats & { isTimeout?: boolean }) => {
    if (!localPlayer) return;
    
    const progress: GameProgress = {
      playerId: localPlayer.id,
      currentStreak: stats.currentStreak,
      totalPuzzles: stats.totalPuzzles,
      successCount: stats.successCount,
      failureCount: stats.failureCount,
      lastUpdateTime: Date.now(),
    };
    
    // Only send progress if game is still in progress
    if (gameInProgress) {
      socketService.sendProgress(progress);
    }
    
    // Update local progress
    setGameProgress((prev) => {
      const next = new Map(prev);
      next.set(localPlayer.id, progress);
      return next;
    });
    
    // Handle timeout (only host calculates and emits)
    if (stats.isTimeout && isHost && currentRoom) {
      handleTimeout();
      return;
    }
    
    // Check if player won by reaching target
    if (gameInProgress && currentRoom?.settings && stats.currentStreak >= currentRoom.settings.targetStreak) {
      checkGameCompletion(stats);
    }
  }, [localPlayer, gameInProgress, currentRoom, isHost, handleTimeout, checkGameCompletion]);

  // Handle incoming messages
  useEffect(() => {
    const unsubscribe = socketService.onMessage((message: SocketMessage) => {
      switch (message.type) {
        case MessageType.ROOM_UPDATE:
          const updatedRoom = message.data.room;
          setCurrentRoom(updatedRoom);
          
          // Update local player state from room data
          if (localPlayer && updatedRoom) {
            const updatedPlayerData = updatedRoom.players.find((p: PlayerInfo) => p.id === localPlayer.id);
            if (updatedPlayerData) {
              setLocalPlayer(updatedPlayerData);
            }
          }
          break;
          
        case MessageType.GAME_STARTED:
          const startTime = Date.now();
          setGameInProgress(true);
          setGameStartTime(startTime);
          setGameProgress(new Map());
          setGameResult(null);
          // Note: Timeout is now handled client-side in multiplayer-game.tsx
          // Each client checks their local timer and triggers handleTimeout via updateProgress
          break;
          
        case MessageType.PROGRESS_UPDATE:
          const { progress } = message.data;
          setGameProgress((prev) => {
            const next = new Map(prev);
            next.set(progress.playerId, progress);
            return next;
          });
          break;
          
        case MessageType.GAME_FINISHED:
          setGameResult(message.data.result);
          setGameInProgress(false);
          
          if (gameCheckIntervalRef.current) {
            clearInterval(gameCheckIntervalRef.current);
            gameCheckIntervalRef.current = null;
          }
          break;
          
        case MessageType.GAME_RESET:
          // Reset game state and return to lobby
          setGameInProgress(false);
          setGameStartTime(null);
          setGameProgress(new Map());
          setGameResult(null);
          
          if (gameCheckIntervalRef.current) {
            clearInterval(gameCheckIntervalRef.current);
            gameCheckIntervalRef.current = null;
          }
          break;
          
        case MessageType.ERROR:
          setError(message.data.message);
          break;
      }
    });
    
    return () => {
      unsubscribe();
      if (gameCheckIntervalRef.current) {
        clearInterval(gameCheckIntervalRef.current);
      }
    };
  }, [isHost, currentRoom, gameStartTime, gameProgress]);

  // Update current room from socket service
  useEffect(() => {
    if (isConnected) {
      const room = socketService.getCurrentRoom();
      if (room) {
        setCurrentRoom(room);
      }
    }
  }, [isConnected]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset game state for rematch
  const resetGame = useCallback(() => {
    setGameInProgress(false);
    setGameStartTime(null);
    setGameProgress(new Map());
    setGameResult(null);
    
    // Reset ready status for all players
    if (localPlayer) {
      setLocalPlayer({ ...localPlayer, isReady: false });
      socketService.setReady(false);
    }
    
    if (gameCheckIntervalRef.current) {
      clearInterval(gameCheckIntervalRef.current);
      gameCheckIntervalRef.current = null;
    }
  }, [localPlayer]);

  const value: MultiplayerContextValue = {
    isConnected,
    isHost,
    currentRoom,
    localPlayer,
    gameInProgress,
    gameStartTime,
    gameProgress,
    gameResult,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    updateSettings,
    startGame,
    updateProgress,
    resetGame,
    error,
    clearError,
  };

  return <MultiplayerContext.Provider value={value}>{children}</MultiplayerContext.Provider>;
};

export const useMultiplayer = (): MultiplayerContextValue => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};
