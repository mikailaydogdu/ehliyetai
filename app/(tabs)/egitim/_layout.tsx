import { Stack } from 'expo-router';

export default function EgitimLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, headerBackTitle: 'Geri' }}>
      <Stack.Screen name="index" options={{ title: 'Notlar' }} />
      <Stack.Screen name="isaretler" options={{ title: 'Trafik İşaretleri' }} />
      <Stack.Screen name="bos" options={{ title: 'Notlar' }} />
    </Stack>
  );
}
