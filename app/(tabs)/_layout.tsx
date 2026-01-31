import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Color Palette extraction from the user's dashboard image
  const ACTIVE_COLOR = '#474747ff'; // Black/Dark for active state
  const INACTIVE_COLOR = '#999999'; // Grey for inactive state

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          marginHorizontal: 20,
          backgroundColor: '#eeececff',
          borderRadius: 20,
          height: 70,

          borderTopWidth: 0,
          paddingBottom: 2, // Reset default padding
          paddingTop: 0,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarItemStyle: {
          paddingTop: 6, // Center icons vertically in the new height
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 4,
          paddingBottom: 6
        }
      }}>

      {/* Home Tab */}
      <Tabs.Screen
        name="index"

        options={{
          title: 'Home',

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Places Tab */}
      <Tabs.Screen
        name="places"
        options={{
          title: 'Places',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "location" : "location-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Trends Tab - Zigzag Arrow */}
      <Tabs.Screen
        name="trends"
        options={{
          title: 'Trends',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "trending-up" : "trending-up-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Explore Tab - Hidden */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />

      {/* Customized Tab - Route */}
      <Tabs.Screen
        name="customized"
        options={{
          title: 'Route',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "gift" : "gift-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
