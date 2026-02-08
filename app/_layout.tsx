import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import Constants from 'expo-constants';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RedirectWhenOffline } from '@/components/RedirectWhenOffline';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { NetworkProvider } from '@/context/NetworkContext';
import { AuthProvider } from '@/context/AuthContext';
import { ContentProvider } from '@/context/ContentContext';
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
  const c = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(colorScheme === 'dark' ? c.background : '#FFFFFF');
      NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark');
    }
  }, [colorScheme, c.background]);

  return (
    <NavThemeProvider value={colorScheme === 'dark' ? DarkThemeCustom : LightTheme}>
      <RedirectWhenOffline />
      <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_bottom',
            gestureEnabled: true,
          }}
          initialRouteName="index">
          <Stack.Screen name="index" options={{ gestureEnabled: false }} />
          <Stack.Screen name="offline" options={{ gestureEnabled: false, title: 'Bağlantı Yok' }} />
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false, title: 'Hoş Geldin' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="calisma" options={{ title: 'Konu Testi' }} />
          <Stack.Screen name="sinav-baslangic" options={{ title: 'Sınav Başlangıç' }} />
          <Stack.Screen name="quiz" options={{ title: 'Sınav', gestureEnabled: false }} />
          <Stack.Screen name="profil-guncelleme" options={{ title: 'Profil Güncelleme' }} />
          <Stack.Screen name="yardim" options={{ title: 'Yardım' }} />
          <Stack.Screen name="istatistikler" options={{ title: 'İstatistikler' }} />
          <Stack.Screen name="sinav-sonuclari" options={{ title: 'Sınav Sonuçları' }} />
          <Stack.Screen name="sinav-stratejisi" options={{ title: 'Sınav Stratejisi' }} />
          <Stack.Screen name="uygulama-hakkinda" options={{ title: 'Uygulama Hakkında' }} />
          <Stack.Screen name="gizlilik" options={{ title: 'Gizlilik Politikası' }} />
          <Stack.Screen name="kullanim-kosullari" options={{ title: 'Kullanım Koşulları' }} />
          <Stack.Screen name="sikca-sorulan-sorular" options={{ title: 'Sıkça Sorulan Sorular' }} />
          <Stack.Screen name="pro-uyelik" options={{ title: 'Pro Üyelik' }} />
        </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

SplashScreen.preventAutoHideAsync();

function AdMobInit() {
  useEffect(() => {
    // No AdMob native module in Expo Go; init only in dev/production build
    if (Platform.OS === 'android' && Constants.appOwnership !== 'expo') {
      import('react-native-google-mobile-ads')
        .then(({ default: mobileAds }) => mobileAds().initialize())
        .catch(() => {});
    }
  }, []);
  return null;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AdMobInit />
      <ThemeProvider>
        <NetworkProvider>
          <AuthProvider>
            <ContentProvider>
              <StatsProvider>
                <ExamDateProvider>
                  <WrongQuestionsProvider>
                    <RootStack />
                  </WrongQuestionsProvider>
                </ExamDateProvider>
              </StatsProvider>
            </ContentProvider>
          </AuthProvider>
        </NetworkProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
