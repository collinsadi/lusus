import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { PuzzleProvider } from '@/context/puzzle-context';
import { SplashProvider, useSplashContext } from '@/context/splash-context';
import SplashScreen from './splash';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const { shouldShowSplash, splashNote, dismissSplash } = useSplashContext();

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen 
          name="rules" 
          options={{ 
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }} 
        />
      </Stack>
      
      {/* Splash screen overlay */}
      {shouldShowSplash && (
        <SplashScreen note={splashNote} onDismiss={dismissSplash} />
      )}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SplashProvider>
          <PuzzleProvider>
            <AppContent />
            <StatusBar style="light" />
          </PuzzleProvider>
        </SplashProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
