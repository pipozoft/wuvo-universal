import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Uniwind } from 'uniwind';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ConvexReactClient } from 'convex/react';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const NavigationLayout = () => {
  const { isSignedIn = false } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="privacy" options={{ presentation: 'modal' }} />
        <Stack.Screen name="terms" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="child/[id]" />
        <Stack.Screen name="child/[id]/search" options={{ presentation: 'modal' }} />
        <Stack.Screen name="child/[id]/category/[categoryId]" />
        <Stack.Screen name="child/[id]/video/[videoId]" options={{ presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
};

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  Uniwind.setTheme('dark');
  return (
    <ThemeProvider value={NAV_THEME.dark}>
      <StatusBar style={'light'} />
      <ClerkProvider tokenCache={tokenCache}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <NavigationLayout />
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ThemeProvider>
  );
}
