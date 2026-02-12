import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Color Palette extraction from the user's dashboard image
  const ACTIVE_COLOR = '#4F46E5'; // Black/Dark for active state
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
          backgroundColor: '#FFFFFF',
          borderRadius: 25,
          height: 75,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: '#F1F5F9',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5,
        },
        tabBarItemStyle: {
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          paddingBottom: 10,
        }
      }}>

      {/* Home Tab */}
      <Tabs.Screen
        name="index"

        options={{
          title: t('tabs.home'),

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
          title: t('tabs.places'),
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
          title: t('tabs.trends'),
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
          title: t('tabs.route'),
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
