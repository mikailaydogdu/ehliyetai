import { Stack } from 'expo-router';

export default function EgitimLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerBackTitle: 'Geri' }}>
      <Stack.Screen name="index" options={{ title: 'Eğitim', headerShown: false }} />
      <Stack.Screen name="isaretler" options={{ title: 'Trafik İşaretleri', headerShown: false }} />
      <Stack.Screen name="bos" options={{ title: 'Eğitim' }} />
    </Stack>
  );
}
