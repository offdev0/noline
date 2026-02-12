import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SideDrawer from '@/components/SideDrawer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MapWidget from '@/components/dashboard/MapWidget';
import PlacesSection from '@/components/dashboard/PlacesSection';
import SearchBar from '@/components/dashboard/SearchBar';
import XPGainAnimation from '@/components/rewards/XPGainAnimation';
import { useLocation } from '@/context/LocationContext';
import { useUser } from '@/context/UserContext';
import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function DashboardScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const { user, streak, points, lastXpGained, clearXpGained } = useUser();
  const { permissionStatus, requestLocation } = useLocation();



  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          <DashboardHeader onMenuPress={() => setIsDrawerOpen(true)} />

          {lastXpGained > 0 && (
            <XPGainAnimation amount={lastXpGained} onComplete={clearXpGained} />
          )}

          <View style={styles.titleContainer}>
            <Text style={styles.titleBlue}>{t('dashboard.titleLine1')}</Text>
            <Text style={styles.titleBlue}>{t('dashboard.titleLine2')}</Text>
          </View>

          {permissionStatus !== 'granted' && (
            <TouchableOpacity
              style={styles.locationBanner}
              onPress={requestLocation}
              activeOpacity={0.9}
            >
              <View style={styles.locationBannerContent}>
                <Ionicons name="location-outline" size={20} color="#6366F1" />
                <Text style={styles.locationBannerText}>
                  {t('dashboard.enableLocation')}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#6366F1" />
              </View>
            </TouchableOpacity>
          )}

          <SearchBar />

          <MapWidget />

          <PlacesSection />

        </ScrollView>
      </SafeAreaView>

      <SideDrawer
        isVisible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userEmail={user?.email || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleBlue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4E46E5', // Matches the purple/blue theme
  },
  locationBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#EEF2FF',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  locationBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
    marginHorizontal: 10,
  },
});
