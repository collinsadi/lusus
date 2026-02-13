/**
 * Network utilities for multiplayer
 */
import * as Network from 'expo-network';

/**
 * Get the device's local IP address on the current network
 * Returns null if unable to determine IP
 */
export async function getLocalIpAddress(): Promise<string | null> {
  try {
    const ip = await Network.getIpAddressAsync();
    
    // Filter out loopback and invalid IPs
    if (ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('fe80')) {
      return ip;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get local IP address:', error);
    return null;
  }
}

/**
 * Check if device is connected to a network
 */
export async function isConnectedToNetwork(): Promise<boolean> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected === true && networkState.isInternetReachable === true;
  } catch (error) {
    console.error('Failed to check network state:', error);
    return false;
  }
}

/**
 * Get network type (wifi, cellular, etc.)
 */
export async function getNetworkType(): Promise<string> {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.type || 'unknown';
  } catch (error) {
    console.error('Failed to get network type:', error);
    return 'unknown';
  }
}
