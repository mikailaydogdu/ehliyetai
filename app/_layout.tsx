import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { StatsProvider } from '@/context/StatsContext';
import { ExamDateProvider } from '@/context/ExamDateContext';
import { WrongQuestionsProvider } from '@/context/WrongQuestionsContext';
import { Colors } from '@/constants/theme';

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

const DarkThemeCustom = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};

function RootStack() {
  const { colorScheme } = useTheme();
  return (
    <NavThemeProvider value={colorScheme === 'dark' ? DarkThemeCustom : LightTheme}>
      <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_bottom',
            gestureEnabled: true,
          }}
          initialRouteName="index">
          <Stack.Screen name="index" options={{ gestureEnabled: false }} />
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
          <Stack.Screen name="giris" options={{ gestureEnabled: false }} />
          <Stack.Screen name="kayit" options={{ title: 'Kayıt Ol' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="quiz" options={{ title: 'Sınav', gestureEnabled: false }} />
          <Stack.Screen name="yanlis-sorular" options={{ title: 'Yanlış Yaptığım Sorular' }} />
          <Stack.Screen name="sinav-tarihim" options={{ title: 'Sınav Tarihim' }} />
          <Stack.Screen name="profil-guncelleme" options={{ title: 'Profil Güncelleme' }} />
          <Stack.Screen name="sifre-degistir" options={{ title: 'Şifre Değiştir' }} />
          <Stack.Screen name="yardim" options={{ title: 'Yardım' }} />
          <Stack.Screen name="istatistikler" options={{ title: 'İstatistikler' }} />
        </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatsProvider>
          <ExamDateProvider>
            <WrongQuestionsProvider>
              <RootStack />
            </WrongQuestionsProvider>
          </ExamDateProvider>
        </StatsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
