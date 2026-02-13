import { Stack } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{

        headerShown: false,

      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="explore"
        options={{
          title: 'Explore',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
