import { Stack } from 'expo-router';

export default function CalismaLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerBackTitle: 'Geri' }}>
      <Stack.Screen name="index" options={{ title: 'Chat' }} />
      <Stack.Screen name="[category]" options={{ title: 'Soru' }} />
    </Stack>
  );
}
