import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LOGO_IMAGE = require('../assets/images/ehliyetai.png');

const SLIDES = [
  {
    id: '1',
    title: 'EhliyetAi\'ye Hoş Geldin',
    desc: 'B sınıfı ehliyet sınavına kategorilere göre test çözerek veya 50 soruluk tam sınav simülasyonu ile hazırlan.',
    showLogo: true,
    icon: 'school' as const,
  },
  {
    id: '2',
    title: 'Nasıl Çalışır?',
    desc: 'Yanlış yaptığın sorular otomatik kaydedilir. En az 3 sınav tamamladıktan sonra AI ile ek soru üretebilirsin.',
    showLogo: false,
    icon: 'psychology' as const,
  },
  {
    id: '3',
    title: 'Reklamlar hakkında',
    desc: 'Uygulama ücretsiz sunulmaktadır. Günün sınavı, 3\'ten fazla kategorili konu testi ve tam sınav gibi bazı özelliklerde devam edebilmek için kısa reklam izlemen istenebilir. İstersen Pro üyelik ile reklamsız kullanabilirsin. Devam etmek için aşağıdaki butona tıklayarak bunu kabul etmiş olursun.',
    showLogo: false,
    icon: 'campaign' as const,
  },
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { setHasCompletedOnboarding, setAdsOnboardingAccepted } = useAuth();
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onNext = async () => {
    if (page < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: page + 1 });
      setPage(page + 1);
    } else {
      // Son slayt (reklam): sadece "Onayla" ile uygulamaya girilir
      return;
    }
  };

  const onConfirm = async () => {
    if (page !== SLIDES.length - 1) return;
    await setHasCompletedOnboarding(true);
    await setAdsOnboardingAccepted(true);
    router.replace('/(tabs)');
  };

  const renderItem = ({ item }: { item: (typeof SLIDES)[0] }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      {item.showLogo ? (
        <View style={styles.logoWrap}>
          <Image source={LOGO_IMAGE} style={styles.logoImage} resizeMode="contain" />
        </View>
      ) : (
        <View style={[styles.iconWrap, { backgroundColor: c.selectedBg }]}>
          <MaterialIcons name={item.icon} size={56} color={c.primary} />
        </View>
      )}
      <Text style={[styles.title, { color: c.text }]}>{item.title}</Text>
      <Text style={[styles.desc, { color: c.textSecondary }]}>{item.desc}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === page ? c.primary : c.border },
              ]}
            />
          ))}
        </View>
        {page < SLIDES.length - 1 ? (
          <Pressable
            style={[styles.btn, { backgroundColor: c.primary }]}
            onPress={onNext}
            accessibilityLabel="İleri"
            accessibilityRole="button">
            <Text style={[styles.btnText, { color: c.primaryContrast }]}>İleri</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.btn, { backgroundColor: c.primary }]}
            onPress={onConfirm}
            accessibilityLabel="Onayla"
            accessibilityRole="button">
            <Text style={[styles.btnText, { color: c.primaryContrast }]}>Onayla</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl * 2,
    alignItems: 'center',
  },
  logoWrap: {
    width: 160,
    height: 160,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: { width: 160, height: 160 },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  desc: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  btn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  btnText: { fontSize: 16, fontWeight: '600' },
});
