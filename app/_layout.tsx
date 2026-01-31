import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import { FavoritesProvider } from '@/context/FavoritesContext';
import { LocationProvider } from '@/context/LocationContext';
import { PlacesProvider } from '@/context/PlacesContext';
import { ReportsProvider } from '@/context/ReportsContext';
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
    const inMapRoute = segments[0] === 'map';
    const inFavoritesRoute = segments[0] === 'favorites';
    const inRewardsRoute = segments[0] === 'rewards';
    const inHelpRoute = segments[0] === 'help';
    const inAboutRoute = segments[0] === 'about';
    const inAuthenticatedRoute = inTabsGroup || inPlaceRoute || inMapRoute || inFavoritesRoute || inRewardsRoute || inHelpRoute || inAboutRoute;

    if (user && !inAuthenticatedRoute && segments[0] !== 'modal') {
      console.log('User logged in, redirecting to tabs...');
      router.replace('/(tabs)');
    } else if (!user && inAuthenticatedRoute) {
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
        <Stack.Screen name="index" options={{ headerShown: false, statusBarStyle: 'dark' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, statusBarHidden: false, statusBarStyle: 'dark', statusBarTranslucent: true }} />
        <Stack.Screen name="place" options={{ headerShown: false }} />
        <Stack.Screen name="favorites" options={{ headerShown: false }} />
        <Stack.Screen name="rewards" options={{ headerShown: false }} />
        <Stack.Screen name="help" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen
          name="map"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
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
        <PlacesProvider>
          <FavoritesProvider>
            <ReportsProvider>
              <MainLayout />
            </ReportsProvider>
          </FavoritesProvider>
        </PlacesProvider>
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
