# Lusus Multiplayer Server

Real-time multiplayer game server for Lusus using Socket.io and Express. Handles room management, player connections, game state synchronization, and leaderboard calculations.

## Overview

This server powers the multiplayer mode of Lusus, enabling real-time competitive puzzle-solving between players. It manages:

- **Room Creation & Joining**: Players can create or join game rooms with unique 6-character codes
- **Real-Time Communication**: Socket.io for instant updates on player progress and game state
- **Game State Management**: Tracks all players, their progress, and game settings
- **Automatic Game End**: Handles both win conditions (target streak reached or time limit exceeded)
- **Leaderboard Calculation**: Server-side evaluation of final standings
- **Player Disconnection**: Graceful handling of player leaves and host transfers

### Quick Stats
- **Technology**: Node.js + Express + Socket.io
- **Language**: TypeScript
- **Storage**: In-memory (Maps)
- **Communication**: WebSocket (Socket.io)
- **Default Port**: 3000

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
```

4. Run the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

5. Build for production:
```bash
npm run build
npm start
```

## API Reference

### HTTP Endpoints

**GET /**
- Health check endpoint
- Returns welcome message

**GET /health**
- Server health status
- Returns:
  ```json
  {
    "status": true,
    "time": "2024-01-01T00:00:00.000Z",
    "message": "running",
    "version": "1.0.0",
    "uptime": 12345,
    "memoryUsage": {...},
    "cpuUsage": {...}
  }
  ```

### Socket.io Events

See "Socket Events" section below for detailed event documentation.

## Project Structure

```
server/
├── src/
│   ├── index.ts              # Main server file with Socket.io setup
│   ├── common/
│   │   ├── config/
│   │   │   ├── environment.ts    # Environment configuration
│   │   │   └── database.ts       # Database connection
│   │   └── resources/
│   │       └── logger/           # Winston logger setup
│   └── types/                    # TypeScript type definitions
├── package.json
├── tsconfig.json
└── README.md
```

### Key Files

**`src/index.ts`** - Main server file containing:
- Express server setup
- Socket.io configuration with CORS
- Room management system (create, join, leave)
- Player state tracking
- Game lifecycle handlers (start, progress updates, finish)
- Automatic host transfer on disconnect

**`src/common/config/environment.ts`** - Environment variables:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `APP_NAME`: Application name

## How Multiplayer Works

### Game Flow

1. **Room Creation**
   - Host creates a room with player info
   - Server generates unique 6-character room code
   - Host automatically joins the room

2. **Player Joining**
   - Players join using room code
   - Server validates room exists and is accepting players
   - New player added to room's player list
   - All players receive `room_update` event

3. **Game Configuration**
   - Host sets game settings:
     - **Target Streak**: 5-50 (first to reach wins)
     - **Time Limit**: 30-600 seconds (overall game duration)
   - All players must be ready to start

4. **Game Start**
   - Host initiates game start
   - Server broadcasts `game_starting` (3s countdown)
   - Server broadcasts `game_started` to all players
   - Each player's local timer begins (10s, reducing with streaks)

5. **During Game**
   - Players solve puzzles independently
   - Each correct answer increases their streak
   - Progress updates sent to server via `progress_update`
   - Server broadcasts progress to other players
   - **Win Condition 1**: First player to reach target streak wins immediately
   - **Win Condition 2**: When overall time limit expires, player with highest streak wins

6. **Game End**
   - Winner determined by either:
     - Reaching target streak first, OR
     - Having highest streak when time runs out
   - Server broadcasts `game_finished` with leaderboard
   - All players see results modal with final standings
   - Options to share results or exit

### Socket Events

**Client → Server:**
- `create_room` - Create new game room
- `join_room` - Join existing room
- `set_ready` - Toggle ready status
- `update_settings` - Change game settings (host only)
- `start_game` - Begin the game (host only)
- `progress_update` - Send player progress
- `game_finished` - Send final results (host calculates on timeout)
- `request_rematch` - Reset room for new game
- `leave_room` - Exit the room

**Server → Client:**
- `room_update` - Room state changed (players joined/left, settings changed)
- `settings_updated` - Game settings modified
- `game_starting` - Countdown before game begins
- `game_started` - Game officially started
- `player_progress` - Another player's progress updated
- `game_finished` - Game ended with final leaderboard
- `game_reset` - Room reset for rematch

### Room Management

**Room Status:**
- `waiting` - Accepting new players, game not started
- `starting` - 3-second countdown in progress
- `playing` - Game in progress, no new players allowed
- `finished` - Game completed, showing results

**Host Transfer:**
If the host disconnects:
- First remaining player becomes new host
- If no players remain, room is deleted
- All players notified via `room_update`

## Technical Implementation

### Socket.io Configuration
```typescript
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
```

### Room State Management
Rooms are stored in-memory using JavaScript Maps:
- `rooms`: Map<roomId, MultiplayerRoom>
- `socketToRoom`: Map<socketId, roomId>
- `socketToPlayer`: Map<socketId, playerId>

### Game End Logic
**Target Reached (Player Wins):**
- Any player reaching target streak triggers `game_finished`
- Server validates room status to prevent duplicate finish events
- Winner info and leaderboard broadcast to all players

**Time Limit (Host Calculates):**
- Each client tracks the overall game timer locally
- When timer hits 0, all clients stop playing immediately
- Host calculates winner from final progress data
- Host sends `game_finished` to server
- Server broadcasts results to all players

### Data Structures

**PlayerInfo:**
```typescript
{
  id: string;
  username: string;
  emoji: string;
  isHost: boolean;
  isReady: boolean;
}
```

**RoomSettings:**
```typescript
{
  targetStreak: number;  // 5-50
  timeLimit: number;     // 30-600 seconds
}
```

**GameProgress:**
```typescript
{
  playerId: string;
  currentStreak: number;
  totalPuzzles: number;
  successCount: number;
  failureCount: number;
  lastUpdateTime: number;
}
```

**GameResult:**
```typescript
{
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
```

## Deployment

### Local Network (Development)
1. Start the server: `npm run dev`
2. Find your local IP address:
   - Mac/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`
3. Update client's `socket-service.ts` with your IP:
   ```typescript
   const BACKEND_URL = 'http://YOUR_LOCAL_IP:3000';
   ```
4. Ensure both devices are on the same Wi-Fi network

### Production (Cloud Deployment)
Recommended platforms:
- **Railway**: Easy Node.js deployment with WebSocket support
- **Render**: Free tier with WebSocket support
- **Heroku**: With WebSocket add-on
- **DigitalOcean**: App Platform or Droplet

**Requirements:**
- Node.js 18+
- WebSocket support
- Port 3000 (or configure via environment)

**Environment Variables:**
```env
PORT=3000
NODE_ENV=production
```

## Development

### Testing
```bash
# Run development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start
```

### Monitoring
The server uses Winston logger for tracking:
- Client connections/disconnections
- Room creation/deletion
- Game state changes
- Player actions

Check console output for real-time server activity.

## Troubleshooting

**Connection Issues:**
- Ensure CORS is configured correctly
- Check firewall allows port 3000
- Verify client has correct server URL
- Confirm WebSocket support in deployment

**Room Not Found:**
- Rooms are in-memory only (no persistence)
- Server restart clears all rooms
- Room codes expire when all players leave

**Host Disconnection:**
- New host auto-assigned
- If last player leaves, room deleted
- Clients handle reconnection gracefully

## Future Enhancements
- Room persistence with Redis
- Spectator mode
- Chat system
- Replay system
- Global matchmaking
- Ranked mode with ELO
- Tournament brackets

## License

MIT
