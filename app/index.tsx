import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { hasCompletedOnboarding, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (hasCompletedOnboarding === false) {
      router.replace('/onboarding');
      return;
    }
    if (!user) {
      router.replace('/giris');
      return;
    }
    router.replace('/(tabs)');
  }, [isLoading, hasCompletedOnboarding, user]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
