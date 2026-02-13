# Lusus Multiplayer Documentation

## Overview

The multiplayer feature allows players to compete in real-time puzzle-solving challenges using TCP sockets for peer-to-peer communication. Players can create or join rooms, set game parameters, and compete to reach a target streak within a time limit.

## Features

### 1. Room Creation & Management
- **Create Room**: Host creates a room with a unique 6-character ID
- **Join Room**: Players join using room ID and host's IP address
- **Player Customization**: Each player chooses a username and emoji avatar
- **Room Sharing**: Share room code via native share functionality

### 2. Lobby System
- **Player List**: See all connected players with their avatars
- **Ready Status**: Players mark themselves as ready before starting
- **Host Controls**: Host sets game parameters:
  - Target Streak: 5-50 (adjustable in increments of 5)
  - Time Limit: 30-600 seconds (adjustable in increments of 30)
- **Real-time Updates**: All players see live room updates

### 3. Competitive Gameplay
- **Synchronized Start**: All players start simultaneously
- **Live Progress Tracking**: Real-time leaderboard shows current standings
- **Progress Indicators**: Visual progress bar toward target streak
- **Timer Display**: Countdown timer for time limit
- **Win Conditions**: First to reach target streak OR highest streak when time runs out

### 4. Results & Sharing
- **Victory Card**: Beautiful gradient card for winners
- **Final Standings**: Complete leaderboard with rankings
- **Share Results**: Share victory via native share sheet
- **Rematch Option**: Quickly start another game (planned)

## Architecture

### Components

#### 1. Socket Service (`src/services/multiplayer/socket-service.ts`)
Handles TCP socket connections using `react-native-tcp-socket`:
- Room creation (server mode)
- Room joining (client mode)
- Message broadcasting
- Connection management
- Automatic reconnection

#### 2. Multiplayer Context (`src/context/multiplayer-context.tsx`)
Manages multiplayer state:
- Connection state
- Room information
- Player management
- Game progress tracking
- Results handling

#### 3. Screens

**Multiplayer Lobby** (`src/app/(tabs)/multiplayer.tsx`)
- Entry point for multiplayer
- Create/Join room selection
- Username and emoji selection
- Server connection details

**Waiting Room** (`src/app/multiplayer-lobby.tsx`)
- Player list with ready status
- Game settings configuration (host)
- Start game button (host)
- Room code sharing

**Game Screen** (`src/app/multiplayer-game.tsx`)
- Real-time puzzle gameplay
- Live leaderboard sidebar
- Progress tracking
- Timer and target display

**Results Screen** (`src/app/multiplayer-results.tsx`)
- Winner announcement
- Shareable victory card
- Final standings
- Rematch and exit options

### Message Types

```typescript
enum MessageType {
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
```

## Usage Flow

### For Host (Creating a Room)

1. **Navigate to Multiplayer**
   - Tap the green multiplayer button on the main screen
   - Select "Create Room"

2. **Set Up Profile**
   - Enter username (max 20 characters)
   - Choose emoji avatar from 24 options
   - Tap "Create Room"

3. **Configure Game**
   - Room ID is automatically generated
   - Share room code with friends
   - Adjust Target Streak (5-50)
   - Set Time Limit (30-600 seconds)

4. **Wait for Players**
   - See players join in real-time
   - Wait for all players to mark as ready
   - Tap "Start Game" when everyone is ready

5. **Play & Compete**
   - Solve puzzles to build streak
   - Monitor leaderboard to see rankings
   - First to target streak wins!

6. **View Results**
   - See winner announcement
   - Check final standings
   - Share results or play again

### For Player (Joining a Room)

1. **Navigate to Multiplayer**
   - Tap the green multiplayer button
   - Select "Join Room"

2. **Enter Room Details**
   - Input 6-character room ID from host
   - Enter username and choose emoji
   - Provide host's IP address (e.g., 192.168.1.1)
   - Enter port number (default: 3000)
   - Tap "Join Room"

3. **Wait in Lobby**
   - See game settings set by host
   - Mark yourself as ready
   - Wait for host to start game

4. **Play & Compete**
   - Solve puzzles to increase streak
   - Compete against other players
   - Race to reach target first!

5. **View Results**
   - See who won
   - Check your ranking
   - Share or exit

## Network Configuration

### Setting Up the Host

The host device needs to:

1. **Know its local IP address**
   - iOS: Settings → Wi-Fi → Info icon → IP Address
   - Android: Settings → Wi-Fi → Advanced → IP Address

2. **Choose a port** (default: 3000)
   - Ensure the port is not in use
   - Share this port with joining players

3. **Be on the same network**
   - All players must be on the same Wi-Fi network
   - Or use local network discovery

### Firewall Considerations

- Ensure TCP traffic is allowed on the chosen port
- Local network access should be enabled
- Some networks may block peer-to-peer connections

## Technical Details

### Connection Flow

```
1. Host creates room
   └─> Initializes room state
   └─> Generates room ID
   └─> Becomes server

2. Players join
   └─> Connect to host's IP:Port
   └─> Send JOIN_ROOM message
   └─> Receive ROOM_UPDATE

3. Host starts game
   └─> Validates all players ready
   └─> Broadcasts START_GAME
   └─> Waits 3 seconds
   └─> Broadcasts GAME_STARTED

4. During gameplay
   └─> Players send PROGRESS_UPDATE
   └─> Host tracks all progress
   └─> Players receive updates

5. Game ends
   └─> Host detects win condition
   └─> Calculates final standings
   └─> Broadcasts GAME_FINISHED
```

### State Synchronization

- **Room State**: Synchronized via ROOM_UPDATE messages
- **Game Progress**: Each player broadcasts their progress
- **Win Detection**: Host monitors all progress and declares winner
- **Reconnection**: Automatic reconnection with exponential backoff (up to 5 attempts)

### Performance Considerations

- **Message Throttling**: Progress updates sent on puzzle completion (not continuously)
- **Efficient JSON**: Minimal message payloads for low latency
- **Local State**: UI updates immediately, then syncs with network
- **Network Resilience**: Handles disconnections gracefully

## Future Enhancements

### Planned Features

1. **Server Infrastructure**
   - Dedicated game server
   - Cloud-based room management
   - No IP address sharing needed

2. **Enhanced Matchmaking**
   - Quick match with random players
   - Skill-based matchmaking
   - Ranked mode with ELO ratings

3. **Additional Game Modes**
   - Tournament brackets
   - Team-based gameplay
   - Custom puzzle types for multiplayer

4. **Social Features**
   - Friend system
   - Private messaging
   - Leaderboards and achievements

5. **Spectator Mode**
   - Watch ongoing matches
   - Replay system
   - Live streaming integration

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to room
- **Solution**: Verify both devices on same network
- **Solution**: Check IP address is correct
- **Solution**: Ensure port is not blocked

**Problem**: Disconnects during game
- **Solution**: Stay close to Wi-Fi router
- **Solution**: Disable battery optimization
- **Solution**: Check network stability

### Gameplay Issues

**Problem**: Progress not updating
- **Solution**: Check network connection
- **Solution**: Restart the app
- **Solution**: Rejoin the room

**Problem**: Game doesn't start
- **Solution**: Ensure all players are ready
- **Solution**: Check minimum 2 players
- **Solution**: Verify settings are configured

## Security & Privacy

- **Local Network**: All communication stays on local network
- **No Data Collection**: Player data not stored or transmitted externally
- **Ephemeral Rooms**: Rooms exist only during session
- **No Account Required**: Play without registration

## Testing Checklist

- [ ] Create room successfully
- [ ] Join room with correct credentials
- [ ] Player list updates in real-time
- [ ] Ready status syncs correctly
- [ ] Settings update for all players
- [ ] Game starts synchronized
- [ ] Progress updates in real-time
- [ ] Leaderboard sorts correctly
- [ ] Win detection works (target reached)
- [ ] Time limit enforced correctly
- [ ] Results screen displays properly
- [ ] Share functionality works
- [ ] Graceful disconnect handling
- [ ] Reconnection works as expected

## Dependencies

- `react-native-tcp-socket`: TCP socket communication
- `expo-router`: Navigation between screens
- `expo-linear-gradient`: Victory card gradients
- `@expo/vector-icons`: UI icons

## Contributing

When adding multiplayer features:

1. Update message types in `src/types/multiplayer.ts`
2. Add handlers in `socket-service.ts`
3. Update context if state changes needed
4. Test with multiple devices
5. Document new features here

---

**Note**: This is a peer-to-peer implementation for local network play. For production use with remote players, implement a dedicated game server with proper security, matchmaking, and anti-cheat measures.
