import { Stack, useSegments, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

export default function CalismaLayout() {
  const segments = useSegments();
  const navigation = useNavigation();
  // tabs / calisma / [category] → 3+ segment = quiz ekranı
  const isQuiz = segments.length > 2;

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: !isQuiz });
  }, [isQuiz, navigation]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[category]" />
    </Stack>
  );
}
