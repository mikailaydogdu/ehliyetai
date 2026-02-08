import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/constants/theme';

/**
 * Konu testi: Tek quiz ekranında gösterilir. Bu route sadece /quiz'e yönlendirir.
 */
export default function CalismaCategoryRedirect() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (category) {
      router.replace({ pathname: '/quiz', params: { category } as never });
    }
  }, [category]);

  if (!category) return null;

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
    padding: Spacing.xl,
  },
});
