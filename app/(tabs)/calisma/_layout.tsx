import { Stack } from 'expo-router';

export default function CalismaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, headerBackTitle: 'Geri' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[category]" options={{ headerShown: false }} />
    </Stack>
  );
}
