import SideDrawer from '@/components/SideDrawer';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<any>>();

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

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsDrawerOpen(true)}>
              <Ionicons name="menu-outline" size={32} color="#666" />
            </TouchableOpacity>
            <View style={styles.pointsBadge}>
              <Ionicons name="medal-outline" size={24} color="#888" style={{ marginRight: 4 }} />
              {/* Note: The image had a specific medal icon, using ionicons basic one for now or we can use an image */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="flame" size={16} color="#FF6B00" />
                <Text style={styles.pointsText}>0</Text>
              </View>
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleBlue}>Before you leave</Text>
            <Text style={styles.titleBlue}>– Check the queue!</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/100?img=33' }} // Placeholder Avatar
              style={styles.avatar}
            />
            <TextInput
              placeholder="Search for a place or category"
              style={styles.searchInput}
              placeholderTextColor="#999"
            />
            <TouchableOpacity>
              <Ionicons name="search" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Action Buttons (Search history/filters placeholders) - Hidden based on image, but maybe useful later */}

          {/* Map Widget */}
          <View style={styles.mapWidgetContainer}>
            {/* Simulated Map Preview */}
            <View style={styles.mapPreview}>
              <Image
                source={{ uri: 'https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=13&size=600x300&maptype=roadmap&key=YOUR_API_KEY_HERE' }} // Placeholder static map or just a grey box
                style={styles.mapImage}
              />
              {/* Overlay Error/Info Box from screenshot */}
              <View style={[styles.mapOverlayBox, { zIndex: 2 }]}>
                <Text style={styles.overlayTitle}>Location</Text>
                <Text style={styles.overlayText}>Current Location near you.</Text>
              </View>

              {/* Open Full Map Button */}
              <View style={styles.floatingMapButtonContainer}>
                <TouchableOpacity style={styles.openMapButton}>
                  <Ionicons name="map-outline" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.openMapText}>Open full map</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Places with special atmosphere */}
          <View style={styles.sectionContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>Places with a special atmosphere</Text>
              <Text style={{ fontSize: 16 }}> ✨</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsScroll}>
              {/* Card 1 */}
              <View style={styles.placeCard}>
                <LinearGradient
                  colors={['#a8c0ff', '#3f2b96']} // Placeholder gradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardImagePlaceholder}
                />
                <Text style={styles.cardTitle}>Uniqlo</Text>
              </View>

              {/* Card 2 */}
              <View style={styles.placeCard}>
                <LinearGradient
                  colors={['#fbc2eb', '#a6c1ee']} // Placeholder gradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardImagePlaceholder}
                />
                <Text style={styles.cardTitle}>H&M</Text>
              </View>
              {/* Card 3 */}
              <View style={styles.placeCard}>
                <LinearGradient
                  colors={['#84fab0', '#8fd3f4']} // Placeholder gradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardImagePlaceholder}
                />
                <Text style={styles.cardTitle}>Zara</Text>
              </View>
            </ScrollView>
          </View>

        </ScrollView>
      </SafeAreaView>

      <SideDrawer
        isVisible={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userEmail="user@noline.com"
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  pointsBadge: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  pointsText: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 24,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  mapWidgetContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff', // Border wrapper
    padding: 8,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  mapPreview: {
    borderRadius: 16,
    height: 200,
    backgroundColor: '#f0f0f0',
    position: 'relative',
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.5, // Placeholder effect
  },
  mapOverlayBox: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overlayTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  overlayText: {
    color: '#666',
    fontSize: 14,
  },
  floatingMapButtonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  openMapButton: {
    backgroundColor: '#5356FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  openMapText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionContainer: {
    paddingLeft: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  cardsScroll: {
    paddingBottom: 20,
  },
  placeCard: {
    marginRight: 16,
    width: 140,
  },
  cardImagePlaceholder: {
    width: 140,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 4,
  },

});
