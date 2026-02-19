import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Uniwind, useUniwind } from 'uniwind';
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
        <Stack.Screen
          name="(auth)/sign-in"
          options={{
            title: 'Sign In',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)/terms/index"
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="(auth)/privacy/index"
          options={{
            presentation: 'modal',
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(app)/index" />
        <Stack.Screen name="(app)/child/[id]/index" />
        <Stack.Screen name="(app)/child/[id]/category/[categoryId]/index" />
        <Stack.Screen name="(app)/child/[id]/video/[videoId]/index" />
      </Stack.Protected>
    </Stack>
  );
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

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
