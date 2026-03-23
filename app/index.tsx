import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Image,
  ImageBackground,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop';
const AVATAR_IMAGE =
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=200&auto=format&fit=crop';

export default function ClientHomeScreen() {
  return (
    <LinearGradient colors={['#F6F7FB', '#FFFFFF']} style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.wrapper}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Check the queue!</Text>

            <View style={styles.searchBar}>
              <View style={styles.avatarWrap}>
                <Image source={{ uri: AVATAR_IMAGE }} style={styles.avatar} />
              </View>
              <TextInput
                placeholder="Search for a place or address"
                placeholderTextColor="#9AA0AD"
                style={styles.searchInput}
              />
              <View style={styles.searchButton}>
                <Ionicons name="search" size={20} color="#5A5BFF" />
              </View>
            </View>

            <View style={styles.locationCard}>
              <View style={styles.locationRow}>
                <View style={styles.locationIconWrap}>
                  <Ionicons name="location" size={18} color="#5A5BFF" />
                </View>
                <View style={styles.locationTextWrap}>
                  <Text style={styles.locationTitle}>Target Location</Text>
                  <Text style={styles.locationSubtitle}>Israel</Text>
                </View>
              </View>
              <View style={styles.mapButton}>
                <Ionicons name="map" size={20} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Real-time reports</Text>
              <View style={styles.seeAllPill}>
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={14} color="#5A5BFF" />
              </View>
            </View>

            <View style={styles.reportCard}>
              <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.reportImage} imageStyle={styles.reportImageRadius}>
                <View style={styles.reportTopRow}>
                  <View style={styles.categoryPill}>
                    <Ionicons name="restaurant" size={14} color="#FFFFFF" />
                    <Text style={styles.categoryText}>RESTAURANT</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#F5B73D" />
                    <Text style={styles.ratingText}>4.6</Text>
                  </View>
                </View>
              </ImageBackground>

              <View style={styles.reportBody}>
                <Text style={styles.reportTitle}>ROODI</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>Short queue</Text>
                </View>
                <Text style={styles.distanceText}>1.0 km</Text>

                <LinearGradient colors={['#5A5BFF', '#4B3FEF']} style={styles.detailsButton}>
                  <Text style={styles.detailsText}>View details</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </LinearGradient>
              </View>
            </View>
          </ScrollView>

          <View style={styles.bottomNav}>
            <View style={styles.navItemActive}>
              <Ionicons name="home" size={20} color="#5A5BFF" />
              <Text style={styles.navTextActive}>Home</Text>
            </View>
            <View style={styles.navItem}>
              <Ionicons name="location-outline" size={20} color="#A1A6B3" />
              <Text style={styles.navText}>Places</Text>
            </View>
            <View style={styles.navItem}>
              <Ionicons name="analytics-outline" size={20} color="#A1A6B3" />
              <Text style={styles.navText}>Explore</Text>
            </View>
            <View style={styles.navItem}>
              <Ionicons name="gift-outline" size={20} color="#A1A6B3" />
              <Text style={styles.navText}>Route</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  safeArea: {
    flex: 1
  },
  wrapper: {
    flex: 1
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#3B3CF6',
    marginBottom: 18
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#2A2D3D',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    marginBottom: 18
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    marginRight: 10
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#343A46'
  },
  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#2A2D3D',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 22
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  locationTextWrap: {
    justifyContent: 'center'
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#303443'
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#8A90A0',
    marginTop: 2
  },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5A5BFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3140'
  },
  seeAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A5BFF',
    marginRight: 4
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#2A2D3D',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    overflow: 'hidden',
    marginBottom: 40
  },
  reportImage: {
    height: 180,
    width: '100%',
    justifyContent: 'space-between',
    padding: 14
  },
  reportImageRadius: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  reportTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14
  },
  categoryText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600'
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#2C3140'
  },
  reportBody: {
    padding: 16
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C3140',
    marginBottom: 10
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DDF7E6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 10
  },
  statusText: {
    color: '#1B9A66',
    fontSize: 12,
    fontWeight: '600'
  },
  distanceText: {
    fontSize: 14,
    color: '#5E667A',
    marginBottom: 16
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 18
  },
  detailsText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#2A2D3D',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6
  },
  navItem: {
    alignItems: 'center'
  },
  navItemActive: {
    alignItems: 'center'
  },
  navText: {
    fontSize: 11,
    color: '#A1A6B3',
    marginTop: 4
  },
  navTextActive: {
    fontSize: 11,
    color: '#5A5BFF',
    marginTop: 4,
    fontWeight: '600'
  }
});
