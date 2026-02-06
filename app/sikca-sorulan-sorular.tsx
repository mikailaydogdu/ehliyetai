import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius, TOUCH_TARGET_MIN } from '@/constants/theme';

const SSS = [
  {
    s: 'Uygulama nasıl kullanılır?',
    c: 'Sınav sekmesinden konu testleri (kategorilere göre 10 soru) veya tam sınav (50 soru) çözebilirsiniz. Notlar sekmesinden konu özetlerine, anasayfadan günün sorusuna erişebilirsiniz.',
  },
  {
    s: 'Yanlış yaptığım sorular nerede?',
    c: 'Menüden "Yanlış Yaptığım Sorular"a girerek sınav ve testlerde yanlış cevapladığınız soruları kategorilere göre tekrar çözebilirsiniz.',
  },
  {
    s: 'Sınav tarihimi nasıl girerim?',
    c: 'Menüde "Sınav Tarihim"e tıklayarak sınav tarihinizi kaydedebilirsiniz. Anasayfada sınava kalan gün görüntülenir.',
  },
  {
    s: 'Sonuçlarım kaydediliyor mu?',
    c: 'Evet. Giriş yaptığınız hesaba sınav sonuçları, yanlış sorular ve sınav tarihi bağlı cihazınızdan güvenli şekilde saklanır.',
  },
  {
    s: 'İstatistiklere nereden ulaşırım?',
    c: 'Profil sekmesindeki "İstatistikler" ile son sınav sonuçlarınızı ve kategorilere göre yanlış dağılımını görebilirsiniz.',
  },
];

export default function SikcaSorulanSorularScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Pressable
        onPress={() => router.back()}
        style={styles.backBtn}
        accessibilityLabel="Geri"
        accessibilityHint="Önceki sayfaya dön">
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.text }]}>Sıkça Sorulan Sorular</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {SSS.map((item, index) => (
          <View
            key={index}
            style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
            <Text style={[styles.question, { color: c.text }]}>{item.s}</Text>
            <Text style={[styles.answer, { color: c.textSecondary }]}>{item.c}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    minWidth: TOUCH_TARGET_MIN,
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  question: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  answer: { fontSize: 15, lineHeight: 22 },
});
