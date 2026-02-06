import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius, TOUCH_TARGET_MIN } from '@/constants/theme';

const SECTIONS = [
  {
    title: 'Kabul',
    content:
      'EhliyetAI mobil uygulamasını ve ilgili hizmetleri ("Hizmet") kullanarak bu Kullanım Koşullarını kabul etmiş sayılırsınız. Koşulları kabul etmiyorsanız uygulamayı kullanmayınız.',
  },
  {
    title: 'Hizmetin tanımı',
    content:
      'EhliyetAI, B sınıfı sürücü belgesi sınavına hazırlık amacıyla sunulan bir eğitim uygulamasıdır. Uygulama; konu testleri, tam sınav simülasyonu, günlük sorular, yapay zeka destekli açıklamalar ve istatistikler gibi özellikler sunar. Hizmet "olduğu gibi" sunulmaktadır.',
  },
  {
    title: 'Kullanım kuralları',
    content:
      'Uygulama içeriği yalnızca kişisel çalışma ve öğrenme amacıyla kullanılmalıdır. İçeriğin ticari kullanımı, kopyalanması, yeniden dağıtılması veya üçüncü taraflara satılması yasaktır. Uygulamanın çalışmasını bozacak, veri toplayacak veya başka kullanıcıları etkileyecek müdahaleler yasaktır.',
  },
  {
    title: 'Hesap ve veriler',
    content:
      'Hesap oluşturmanız isteğe bağlıdır. Hesap bilgilerinizin doğru ve güncel olması sizin sorumluluğunuzdadır. Şifrenizi kimseyle paylaşmayın. Uygulama içi verileriniz (sınav sonuçları, yanlış sorular vb.) Gizlilik Politikası kapsamında işlenir.',
  },
  {
    title: 'Fikri mülkiyet',
    content:
      'Uygulama, arayüz, logo, metin ve içerikler dahil tüm unsurların fikri mülkiyet hakları EhliyetAI’ye aittir. İzinsiz kopyalama, dağıtma veya türev çalışma oluşturma yasaktır.',
  },
  {
    title: 'Sorumluluk reddi',
    content:
      'Uygulama bilgilendirme ve pratik amaçlıdır. Resmi sınav kuralları, soruları ve geçme koşulları ilgili resmi kurumlarca belirlenir. Sınav başarınız yalnızca sizin çalışmanıza bağlıdır. EhliyetAI, sınav sonucu veya yanlış bilgi nedeniyle oluşan zararlardan sorumlu tutulamaz.',
  },
  {
    title: 'Hizmetin değiştirilmesi ve sona ermesi',
    content:
      'Hizmet özellikleri, içerik veya erişim koşulları önceden bildirim yapılmaksızın değiştirilebilir. Koşulları ihlal etmeniz halinde hesabınız veya erişiminiz sonlandırılabilir.',
  },
  {
    title: 'Değişiklikler',
    content:
      'Bu Kullanım Koşulları güncellenebilir. Güncel metin uygulama ve web sitemizde yayınlanacaktır. Kullanıma devam etmeniz güncel koşulları kabul ettiğiniz anlamına gelir.',
  },
  {
    title: 'Uygulanacak hukuk ve iletişim',
    content:
      'Bu koşullar Türkiye Cumhuriyeti mevzuatına tabidir. Uyuşmazlıklarda Türk mahkemeleri yetkilidir. Sorularınız için uygulama içi Yardım bölümünden veya web sitemizdeki iletişim bilgilerinden bize ulaşabilirsiniz.',
  },
];

export default function KullanimKosullariScreen() {
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
        <Text style={[styles.headerTitle, { color: c.text }]}>Kullanım Koşulları</Text>
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
