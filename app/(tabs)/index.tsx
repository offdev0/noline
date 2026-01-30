import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SideDrawer from '@/components/SideDrawer';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MapWidget from '@/components/dashboard/MapWidget';
import PlacesSection from '@/components/dashboard/PlacesSection';
import SearchBar from '@/components/dashboard/SearchBar';
import { useUser } from '@/context/UserContext';

export default function DashboardScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const { user } = useUser();

  // Effect to hide tab bar when drawer is open
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isDrawerOpen ? { display: 'none' } : {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        marginHorizontal: 20,
        backgroundColor: '#eeececff',
        borderRadius: 20,
        height: 70,
        borderTopWidth: 0,
        paddingBottom: 2,
        paddingTop: 0,
        justifyContent: 'center',
        alignItems: 'center',
      }
    });
  }, [isDrawerOpen, navigation]);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          <DashboardHeader onMenuPress={() => setIsDrawerOpen(true)} points={0} />

          <View style={styles.titleContainer}>
            <Text style={styles.titleBlue}>Before you leave</Text>
            <Text style={styles.titleBlue}>– Check the queue!</Text>
          </View>

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
});
