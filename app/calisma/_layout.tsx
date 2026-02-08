import { Stack } from 'expo-router';

export default function CalismaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[category]" />
    </Stack>
  );
}
