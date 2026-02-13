# Multiplayer Setup Guide

## Quick Start for Developers

### Installation

The multiplayer feature requires these additional dependencies:

```bash
npm install react-native-tcp-socket react-native-view-shot
```

These are already included in `package.json` and will be installed automatically with `npm install`.

### Platform-Specific Setup

#### iOS

1. **Update Info.plist**

Add the following to your `ios/[YourApp]/Info.plist` to allow local network discovery:

```xml
<key>NSLocalNetworkUsageDescription</key>
<string>This app uses local network to connect with nearby players for multiplayer games.</string>
<key>NSBonjourServices</key>
<array>
    <string>_tcp.local.</string>
</array>
```

2. **Permissions**

The app will request local network access permission on first use.

#### Android

1. **Update AndroidManifest.xml**

Add network permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
```

2. **Network Security Config**

For Android 9+ (API 28+), add network security configuration if needed:

Create `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

Then reference it in `AndroidManifest.xml`:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

### Development Testing

#### Testing on Physical Devices

**Best Practice**: Use 2+ physical devices on the same Wi-Fi network.

1. **Device 1 (Host)**
   ```bash
   # Start the app
   npm run ios # or npm run android
   
   # Find the device's local IP
   # iOS: Settings → Wi-Fi → Info icon
   # Android: Settings → Wi-Fi → Advanced
   ```

2. **Device 2+ (Clients)**
   ```bash
   # Start the app on other devices
   npm run ios # or npm run android
   
   # Use host's IP address when joining
   ```

#### Testing on Emulators/Simulators

**Note**: Testing between emulators requires special network configuration.

**iOS Simulators**:
- Use `localhost` or `127.0.0.1` when both host and client are simulators
- For host on simulator and client on physical device, use Mac's IP address

**Android Emulators**:
- Use `10.0.2.2` to access host machine from emulator
- Physical device clients use the development machine's IP

### Network Configuration

#### Finding Your IP Address

**macOS**:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows**:
```bash
ipconfig | findstr IPv4
```

**Linux**:
```bash
hostname -I
```

#### Port Configuration

Default port: `3000`

To change the port:
1. Update default in `src/app/(tabs)/multiplayer.tsx`
2. Ensure the port is not in use:
   ```bash
   # macOS/Linux
   lsof -i :3000
   
   # Windows
   netstat -ano | findstr :3000
   ```

### Troubleshooting

#### Connection Refused

**Problem**: Client cannot connect to host

**Solutions**:
1. Verify both devices on same network
2. Check firewall settings (disable temporarily to test)
3. Confirm correct IP address and port
4. Try pinging the host:
   ```bash
   ping [host-ip-address]
   ```

#### Socket Errors

**Problem**: `EADDRINUSE` error

**Solution**: Port already in use, either:
- Change the port number
- Kill the process using the port:
  ```bash
  # macOS/Linux
  lsof -ti:3000 | xargs kill -9
  
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID [pid] /F
  ```

#### No Local Network Permission (iOS)

**Problem**: App can't access local network

**Solution**:
1. Delete the app
2. Reinstall
3. Grant permission when prompted
4. Or manually enable in Settings → Privacy → Local Network

### Code Structure

```
src/
├── types/
│   └── multiplayer.ts              # Type definitions
├── services/
│   └── multiplayer/
│       └── socket-service.ts       # TCP socket service
├── context/
│   └── multiplayer-context.tsx     # Multiplayer state management
└── app/
    ├── (tabs)/
    │   └── multiplayer.tsx         # Entry screen (create/join)
    ├── multiplayer-lobby.tsx       # Waiting room
    ├── multiplayer-game.tsx        # Game screen
    └── multiplayer-results.tsx     # Results screen
```

### Adding New Features

#### 1. Add New Message Type

In `src/types/multiplayer.ts`:

```typescript
export enum MessageType {
  // ... existing types
  NEW_FEATURE = 'NEW_FEATURE',
}

export interface NewFeatureMessage {
  // Define message structure
}
```

#### 2. Add Socket Handler

In `src/services/multiplayer/socket-service.ts`:

```typescript
handleNewFeature(message: SocketMessage): void {
  // Handle the message
}
```

#### 3. Update Context

In `src/context/multiplayer-context.tsx`:

```typescript
// Add state
const [newFeature, setNewFeature] = useState(...);

// Add action
const useNewFeature = useCallback(() => {
  // Implementation
}, []);
```

#### 4. Update UI

Add UI components in relevant screens.

### Testing Checklist

Before committing multiplayer changes:

- [ ] Test on physical iOS device
- [ ] Test on physical Android device  
- [ ] Test with 2+ simultaneous players
- [ ] Test connection failure scenarios
- [ ] Test reconnection logic
- [ ] Test with poor network conditions
- [ ] Verify all message types work
- [ ] Check memory leaks (long sessions)
- [ ] Verify proper cleanup on disconnect
- [ ] Test edge cases (host leaves, etc.)

### Performance Tips

1. **Throttle Updates**: Only send progress on significant events
2. **Batch Messages**: Combine multiple updates when possible
3. **Optimize Payloads**: Keep message sizes minimal
4. **Connection Pooling**: Reuse connections when appropriate
5. **Graceful Degradation**: Handle network issues elegantly

### Security Considerations

⚠️ **Important**: This is a local network peer-to-peer implementation.

For production:
- Implement proper authentication
- Add message encryption (TLS/SSL)
- Validate all incoming messages
- Rate limit message sending
- Implement anti-cheat measures
- Use dedicated game servers
- Add replay verification

### Common Issues

#### Issue: Players see different game states

**Solution**: Ensure single source of truth (host) and synchronize on conflicts

#### Issue: High latency

**Solution**: 
- Reduce update frequency
- Optimize message payloads
- Check network quality
- Consider predictive algorithms

#### Issue: Memory leaks

**Solution**:
- Always cleanup listeners in useEffect
- Properly destroy sockets on unmount
- Clear intervals/timeouts

### Resources

- [react-native-tcp-socket docs](https://github.com/Rapsssito/react-native-tcp-socket)
- [TCP Protocol](https://en.wikipedia.org/wiki/Transmission_Control_Protocol)
- [Real-time Multiplayer Architecture](https://www.gabrielgambetta.com/client-server-game-architecture.html)

### Support

For issues or questions:
1. Check `MULTIPLAYER.md` for user-facing documentation
2. Review the implementation in source files
3. Test network connectivity separately
4. Enable verbose logging for debugging

---

Happy multiplayer coding! 🎮
