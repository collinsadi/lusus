import express, { NextFunction, Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
const app = express();
import { ENVIRONMENT } from "./common/config/environment";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./common/resources/logger";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

dotenv.config();

// Multiplayer room management
interface PlayerInfo {
  id: string;
  username: string;
  emoji: string;
  isHost: boolean;
  isReady: boolean;
}

interface RoomSettings {
  difficulty: string;
  timeLimit: number;
  puzzleTypes: string[];
}

interface MultiplayerRoom {
  id: string;
  hostId: string;
  players: PlayerInfo[];
  settings: RoomSettings | null;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  createdAt: number;
}

const rooms = new Map<string, MultiplayerRoom>();
const socketToRoom = new Map<string, string>();
const socketToPlayer = new Map<string, string>(); // socket.id -> player.id

// Socket.io event handlers
io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Create room
  socket.on("create_room", (data: { playerInfo: Omit<PlayerInfo, 'isHost' | 'isReady'> }, callback) => {
    const roomId = generateRoomId();
    const room: MultiplayerRoom = {
      id: roomId,
      hostId: data.playerInfo.id,
      players: [{
        ...data.playerInfo,
        isHost: true,
        isReady: false,
      }],
      settings: null,
      status: 'waiting',
      createdAt: Date.now(),
    };

    rooms.set(roomId, room);
    socketToRoom.set(socket.id, roomId);
    socketToPlayer.set(socket.id, data.playerInfo.id);
    socket.join(roomId);

    logger.info(`Room created: ${roomId} by ${data.playerInfo.username}`);
    callback({ success: true, roomId, room });
  });

  // Join room
  socket.on("join_room", (data: { roomId: string; playerInfo: Omit<PlayerInfo, 'isHost' | 'isReady'> }, callback) => {
    const room = rooms.get(data.roomId);

    if (!room) {
      callback({ success: false, error: "Room not found" });
      return;
    }

    if (room.status !== 'waiting') {
      callback({ success: false, error: "Room is not accepting new players" });
      return;
    }

    // Add player to room
    room.players.push({
      ...data.playerInfo,
      isHost: false,
      isReady: false,
    });

    socketToRoom.set(socket.id, data.roomId);
    socketToPlayer.set(socket.id, data.playerInfo.id);
    socket.join(data.roomId);

    logger.info(`Player ${data.playerInfo.username} joined room ${data.roomId}`);

    // Notify all players in room
    io.to(data.roomId).emit("room_update", { room });
    callback({ success: true, room });
  });

  // Set ready status
  socket.on("set_ready", (data: { isReady: boolean }) => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const playerId = socketToPlayer.get(socket.id);
    if (!playerId) return;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.isReady = data.isReady;
      io.to(roomId).emit("room_update", { room });
      logger.info(`Player ${player.username} ready status: ${data.isReady}`);
    }
  });

  // Update room settings (host only)
  socket.on("update_settings", (data: { settings: RoomSettings }) => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const playerId = socketToPlayer.get(socket.id);
    if (!playerId || room.hostId !== playerId) return;

    room.settings = data.settings;
    io.to(roomId).emit("settings_updated", { settings: data.settings });
    logger.info(`Room ${roomId} settings updated`);
  });

  // Start game (host only)
  socket.on("start_game", () => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const playerId = socketToPlayer.get(socket.id);
    if (!playerId || room.hostId !== playerId) return;

    room.status = 'starting';
    io.to(roomId).emit("game_starting", { roomId, settings: room.settings });
    logger.info(`Game starting in room ${roomId}`);

    // Move to playing state after 3 seconds
    setTimeout(() => {
      room.status = 'playing';
      io.to(roomId).emit("game_started");
      logger.info(`Game started in room ${roomId}`);
    }, 3000);
  });

  // Progress update
  socket.on("progress_update", (data: { progress: any }) => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;

    const playerId = socketToPlayer.get(socket.id);
    if (!playerId) return;

    socket.to(roomId).emit("player_progress", {
      playerId,
      progress: data.progress
    });
  });

  // Game finished
  socket.on("game_finished", (data: { result: any }) => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    // Only process if game is still in playing state (prevent duplicate finish events)
    if (room.status !== 'playing') {
      logger.info(`Ignoring duplicate game_finished event in room ${roomId}`);
      return;
    }

    room.status = 'finished';
    io.to(roomId).emit("game_finished", { result: data.result });
    logger.info(`Game finished in room ${roomId} - Winner: ${data.result.winnerUsername}`);
  });

  // Request rematch
  socket.on("request_rematch", () => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    // Reset room state for new game
    room.status = 'waiting';

    // Reset all players' ready status
    room.players.forEach(player => {
      player.isReady = false;
    });

    io.to(roomId).emit("room_update", { room });
    io.to(roomId).emit("game_reset");
    logger.info(`Game reset requested in room ${roomId}`);
  });

  // Leave room / disconnect
  socket.on("leave_room", () => {
    handlePlayerLeave(socket);
  });

  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
    handlePlayerLeave(socket);
  });
});

function handlePlayerLeave(socket: any) {
  const roomId = socketToRoom.get(socket.id);
  if (!roomId) return;

  const room = rooms.get(roomId);
  if (!room) return;

  const playerId = socketToPlayer.get(socket.id);
  if (!playerId) return;

  // Remove player from room
  const playerIndex = room.players.findIndex(p => p.id === playerId);
  if (playerIndex !== -1) {
    const playerName = room.players[playerIndex].username;
    room.players.splice(playerIndex, 1);
    logger.info(`Player ${playerName} left room ${roomId}`);
  }

  // If host left, assign new host or delete room
  if (room.hostId === playerId) {
    if (room.players.length > 0) {
      room.hostId = room.players[0].id;
      room.players[0].isHost = true;
      logger.info(`New host for room ${roomId}: ${room.players[0].username}`);
    } else {
      rooms.delete(roomId);
      logger.info(`Room ${roomId} deleted (empty)`);
      socketToRoom.delete(socket.id);
      socketToPlayer.delete(socket.id);
      return;
    }
  }

  socketToRoom.delete(socket.id);
  socketToPlayer.delete(socket.id);
  io.to(roomId).emit("room_update", { room });
}

function generateRoomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// App Security Configurations
app.use(cors());

// JSON parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.disable("x-powered-by");
app.set("trust proxy", true);


// Welcome Message
app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Welcome to Lusus Multiplayer Server",
  });
});

// status check
app.get("/health", (req: Request, res: Response) => {
  res.send({
    status: true,
    time: new Date(),
    message: "running",
    version: "1.0.0",
    timestamp: new Date(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
  });
});

// error handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    status: false,
    message: "An unexpected error occurred",
    error: err instanceof Error ? err.message : "Unknown error",
  });
});

httpServer.listen(ENVIRONMENT.APP.PORT, async () => {
  console.log(
    `${ENVIRONMENT.APP.NAME} Running on http://localhost:${ENVIRONMENT.APP.PORT}`
  );

  logger.info("✅ Server initialized successfully");
});
