import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { LocationProvider } from '@/context/LocationContext';
import { UserProvider, useUser } from '@/context/UserContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

function MainLayout() {
  const { user, loading } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inPlaceRoute = segments[0] === 'place';
    const inAuthenticatedRoute = inTabsGroup || inPlaceRoute;

    if (user && !inAuthenticatedRoute) {
      // Redirect to tabs if user is signed in and not in an authenticated route
      console.log('User logged in, redirecting to tabs...');
      router.replace('/(tabs)');
    } else if (!user && inAuthenticatedRoute) {
      // Redirect to login if user is not signed in but tries to access authenticated routes
      console.log('User logged out, redirecting to login...');
      router.replace('/');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <LinearGradient
        colors={['#5356FF', '#3787FF']}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, statusBarStyle: 'light' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="place" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <LocationProvider>
        <MainLayout />
      </LocationProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});
