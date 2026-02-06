import AppHeader from '@/components/AppHeader';
import { BorderRadius, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
        screenOptions={{
          tabBarActiveTintColor: c.primary,
          tabBarInactiveTintColor: c.tabIconDefault,
          headerShown: true,
          header: () => <AppHeader />,
          tabBarStyle: {
            backgroundColor: c.card,
            borderTopWidth: 1,
            borderTopColor: c.border,
            borderTopLeftRadius: BorderRadius.xl,
            borderTopRightRadius: BorderRadius.xl,
            overflow: 'hidden',
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
          tabBarShowLabel: true,
          headerShadowVisible: false,
        }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Anasayfa',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'home' : 'home-outline'}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="egitim"
        options={{
          title: 'Notlar',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'book-open' : 'book-open-outline'}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calisma"
        options={{
          title: 'EhliyetAI',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'chat' : 'chat-outline'}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sinav"
        options={{
          title: 'Sınav',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'clipboard-text' : 'clipboard-text-outline'}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'account' : 'account-outline'}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />
      </Tabs>
  );
}
