import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius, TOUCH_TARGET_MIN } from '@/constants/theme';

const SECTIONS = [
  {
    title: 'Giriş',
    content:
      'EhliyetAi ("biz", "uygulama") olarak kişisel verilerinizin güvenliğine önem veriyoruz. Bu Gizlilik Politikası, mobil uygulamamızı kullanırken toplanan, kullanılan ve korunan verileri açıklar. Uygulamayı kullanarak bu politikayı kabul etmiş sayılırsınız.',
  },
  {
    title: 'Toplanan veriler',
    content:
      '• Cihazda saklanan veriler: Adınız (isteğe bağlı), sınav tarihi, sınav sonuçları, yanlış cevaplar ve tercihleriniz yalnızca cihazınızda (AsyncStorage) saklanır.\n\n' +
      '• Hesap verileri: Hesap oluşturursanız e-posta adresiniz, adınız ve şifreniz (şifrelenmiş) güvenli altyapıda tutulur.\n\n' +
      '• Kullanım verileri: Sınav istatistikleri, çözülen soru sayıları ve uygulama kullanımına ilişkin veriler hizmetin iyileştirilmesi amacıyla işlenebilir.',
  },
  {
    title: 'Verilerin kullanımı',
    content:
      'Toplanan veriler yalnızca şu amaçlarla kullanılır: uygulamanın işleyişini sağlamak (istatistikler, yanlış sorular, sınav tarihi hatırlatması), kişiselleştirilmiş içerik sunmak ve yasal yükümlülükleri yerine getirmek. Uygulama, ücretsiz kullanımı desteklemek için üçüncü taraf reklam ağları (ör. Google AdMob) aracılığıyla reklam gösterebilir; reklam gösterimi sırasında reklam sağlayıcılarının kendi gizlilik politikaları geçerli olabilir. Verileriniz reklam amacıyla üçüncü taraflarla paylaşılmaz.',
  },
  {
    title: 'Verilerin saklanması ve üçüncü taraflar',
    content:
      'Yerel veriler cihazınızda saklanır. İçerik ve kimlik doğrulama için kullanılan hizmetler (ör. Firebase, Groq API) kendi gizlilik politikalarına tabidir. Bu hizmetlere gönderilen veriler yalnızca uygulama işlevselliği için kullanılır.',
  },
  {
    title: 'Haklarınız',
    content:
      'Verilerinize erişim, düzeltme veya silme talep edebilirsiniz. Uygulama içinden "Profil verilerini sil" ile yerel verilerinizi silebilirsiniz. Hesap verileriniz için destek kanallarından bize ulaşabilirsiniz.',
  },
  {
    title: 'Güvenlik',
    content:
      'Verilerinizi korumak için güvenli altyapı ve şifreleme yöntemleri kullanıyoruz. Şifrenizi kimseyle paylaşmayın. Gizlilik politikasındaki değişiklikler uygulama veya web sitemizde duyurulacaktır.',
  },
  {
    title: 'İletişim',
    content:
      'Gizlilik ile ilgili sorularınız için uygulama içi Yardım bölümünden veya web sitemizdeki iletişim bilgilerinden bize ulaşabilirsiniz.',
  },
];

export default function GizlilikScreen() {
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
        <Text style={[styles.headerTitle, { color: c.text }]}>Gizlilik Politikası</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { color: c.textSecondary }]}>
          Son güncelleme: Şubat 2025
        </Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
          {SECTIONS.map((section, index) => (
            <View key={section.title} style={index > 0 && styles.sectionSpacer}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>{section.title}</Text>
              <Text style={[styles.paragraph, { color: c.textSecondary }]}>{section.content}</Text>
            </View>
          ))}
        </View>
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
  lastUpdated: { fontSize: 13, marginBottom: Spacing.md },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  sectionSpacer: { marginTop: Spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  paragraph: { fontSize: 15, lineHeight: 22, marginBottom: 0 },
});
