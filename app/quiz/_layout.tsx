import { Stack } from 'expo-router';
import { LastQuizWrongProvider } from '@/context/LastQuizWrongContext';

export default function QuizLayout() {
  return (
    <LastQuizWrongProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </LastQuizWrongProvider>
  );
}
