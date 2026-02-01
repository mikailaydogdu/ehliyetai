import AppHeader from '@/components/AppHeader';
import MenuModal from '@/components/MenuModal';
import { Colors } from '@/constants/theme';
import { MenuProvider } from '@/context/MenuContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const springConfig = { damping: 14, stiffness: 180 };

function AnimatedTabIcon({
  focused,
  color,
  size,
  activeName,
  inactiveName,
}: {
  focused: boolean;
  color: string;
  size: number;
  activeName: keyof typeof MaterialCommunityIcons.glyphMap;
  inactiveName: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  const scale = useSharedValue(focused ? 1.12 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.12 : 1, springConfig);
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <MaterialCommunityIcons
        name={focused ? activeName : inactiveName}
        size={size ?? 24}
        color={color}
      />
    </Animated.View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  return (
    <MenuProvider>
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
            <AnimatedTabIcon
              focused={focused}
              color={color}
              size={size ?? 24}
              activeName="home"
              inactiveName="home-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="egitim"
        options={{
          title: 'Eğitim',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              size={size ?? 24}
              activeName="book-open"
              inactiveName="book-open-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calisma"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              size={size ?? 24}
              activeName="chat"
              inactiveName="chat-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sinav"
        options={{
          title: 'Sınav',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              size={size ?? 24}
              activeName="clipboard-text"
              inactiveName="clipboard-text-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              color={color}
              size={size ?? 24}
              activeName="account"
              inactiveName="account-outline"
            />
          ),
        }}
      />
      </Tabs>
      <MenuModal />
    </MenuProvider>
  );
}
