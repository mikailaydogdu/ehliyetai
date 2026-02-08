import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useContent } from '@/context/ContentContext';

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { hasCompletedOnboarding, hasAcceptedAdsOnboarding, isLoading } = useAuth();
  const { isContentLoading } = useContent();

  const canEnterApp = hasCompletedOnboarding === true && hasAcceptedAdsOnboarding === true;

  useEffect(() => {
    if (isLoading) return;
    if (hasCompletedOnboarding === false || hasAcceptedAdsOnboarding === false) {
      router.replace('/onboarding');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => SplashScreen.hideAsync());
      });
      return;
    }
    if (isContentLoading) return;
    router.replace('/(tabs)');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => SplashScreen.hideAsync());
    });
  }, [isLoading, hasCompletedOnboarding, hasAcceptedAdsOnboarding, isContentLoading]);

  if (!isLoading && canEnterApp && isContentLoading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[styles.loadingText, { color: c.textSecondary }]}>İçerik yükleniyor…</Text>
      </View>
    );
  }

  return <View style={[styles.container, { backgroundColor: c.background }]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: Spacing.md, fontSize: 16 },
});
