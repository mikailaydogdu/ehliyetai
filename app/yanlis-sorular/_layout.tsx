import { Stack } from 'expo-router';

export default function YanlisSorularLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[category]" options={{ title: 'Yanlış Sorular' }} />
    </Stack>
  );
}
