import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'B Ehliyet Sınavına Hazırlan',
    subtitle: 'Çıkmış sorular ve kategorilere göre test çözerek sınava hazırlan.',
    icon: 'school' as const,
  },
  {
    id: '2',
    title: 'Yanlışlarını Tekrarla',
    subtitle: 'Yanlış yaptığın soruları kaydet, tekrar çöz ve eksiklerini kapat.',
    icon: 'assignment' as const,
  },
  {
    id: '3',
    title: 'Sınav Simülasyonu',
    subtitle: 'Gerçek sınav formatında 50 soru çöz, süre tut ve kendini test et.',
    icon: 'quiz' as const,
  },
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { completeOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
      router.replace('/giris');
    }
  };

  const onScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { backgroundColor: c.primary + '18' }]}>
              <MaterialIcons name={item.icon} size={64} color={c.primary} />
            </View>
            <Text style={[styles.title, { color: c.text }]}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>{item.subtitle}</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === currentIndex ? c.primary : c.border },
              ]}
            />
          ))}
        </View>
        <Pressable
          style={[styles.button, { backgroundColor: c.primary }]}
          onPress={onNext}
          activeOpacity={0.8}>
          <Text style={[styles.buttonText, { color: c.primaryContrast }]}>
            {currentIndex === SLIDES.length - 1 ? 'Başla' : 'Devam'}
          </Text>
          <MaterialIcons name="arrow-forward" size={22} color={c.primaryContrast} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
});
