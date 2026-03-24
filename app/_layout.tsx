import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';

import MedalUpgradeModal from '@/components/rewards/MedalUpgradeModal';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { LocationProvider } from '@/context/LocationContext';
import { PlacesProvider } from '@/context/PlacesContext';
import { ReportsProvider } from '@/context/ReportsContext';
import { UserProvider, useUser } from '@/context/UserContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

function MainLayout() {
  const { user, loading: authLoading } = useUser();
  const { language, loading: langLoading } = useLanguage();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (authLoading || langLoading) return;

    console.log('Current Auth State:', {
      isLoggedIn: !!user,
      segments,
      inAuthenticatedRoute: !!(segments[0] === '(tabs)' || segments[0] === 'place' || segments[0] === 'map' || segments[0] === 'favorites' || segments[0] === 'rewards' || segments[0] === 'help' || segments[0] === 'about')
    });

    const inAuthenticatedRoute = segments.some(s => ['(tabs)', 'place', 'map', 'favorites', 'rewards', 'help', 'about', 'trends', 'search-results', 'settings', 'account', 'top-reporters', 'category', 'privacy-policy', 'terms-of-service', 'notifications'].includes(s));

    if (user && !inAuthenticatedRoute && segments[0] !== 'modal') {
      console.log('User logged in, redirecting to tabs... Segments:', segments);
      router.replace('/(tabs)');
    } else if (!user && inAuthenticatedRoute) {
      console.log('User logged out, redirecting to login... Segments:', segments);
      setTimeout(() => {
        router.replace('/');
      }, 0);
    }
  }, [user, authLoading, langLoading, segments]);

  if (authLoading || langLoading) {
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
    <View style={{ flex: 1, direction: language === 'he' ? 'rtl' : 'ltr' }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack key={language}>
          <Stack.Screen name="index" options={{ headerShown: false, statusBarStyle: 'dark' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false, statusBarHidden: false, statusBarStyle: 'dark', statusBarTranslucent: true }} />
          <Stack.Screen name="place" options={{ headerShown: false }} />
          <Stack.Screen name="favorites" options={{ headerShown: false }} />
          <Stack.Screen name="rewards" options={{ headerShown: false }} />
          <Stack.Screen name="top-reporters" options={{ headerShown: false }} />
          <Stack.Screen name="trends" options={{ headerShown: false }} />
          <Stack.Screen name="trends/[mood]" options={{ headerShown: false }} />
          <Stack.Screen name="help" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="search-results" options={{ headerShown: false }} />
          <Stack.Screen
            name="map"
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen name="settings/general" options={{ headerShown: false }} />
          <Stack.Screen name="settings/history" options={{ headerShown: false }} />
          <Stack.Screen name="settings/notifications" options={{ headerShown: false }} />
          <Stack.Screen name="account/details" options={{ headerShown: false }} />
          <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
          <Stack.Screen name="terms-of-service" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <MedalUpgradeModal />
        <StatusBar style="auto" />
      </ThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
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
    </LanguageProvider>
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
