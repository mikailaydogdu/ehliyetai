import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius } from '@/constants/theme';
import {
  EXAM_TOTAL_QUESTIONS,
  EXAM_DURATION_MINUTES,
  EXAM_ILK_YARDIM,
  EXAM_TRAFIK_ADABI,
  EXAM_TRAFIK,
  EXAM_MOTOR,
  EXAM_PASS_MIN_CORRECT,
  EXAM_PASS_PERCENT,
  EXAM_THEORY_ATTEMPTS,
  EXAM_DRIVING_ATTEMPTS,
} from '@/data/mockData';

export default function SinavScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={[styles.heroIconWrap, { backgroundColor: c.primary }]}>
            <MaterialIcons name="quiz" size={40} color={c.primaryContrast} />
          </View>
          <Text style={[styles.heroTitle, { color: c.text }]}>B Sınıfı Ehliyet Sınavı</Text>
          <Text style={[styles.heroSubtitle, { color: c.textSecondary }]}>
            {EXAM_TOTAL_QUESTIONS} soru · {EXAM_DURATION_MINUTES} dakika
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              ...getCardShadow(c),
              backgroundColor: c.card,
              borderColor: c.border,
              borderRadius: BorderRadius.xl,
            },
          ]}>
          <Text style={[styles.infoTitle, { color: c.text }]}>Soru dağılımı</Text>
          <View style={[styles.infoRow, { borderBottomColor: c.border }]}>
            <View style={styles.infoLabelWrap}>
              <Text style={[styles.infoLabel, { color: c.textSecondary }]}>Trafik ve Çevre Bilgisi</Text>
              <Text style={[styles.infoSublabel, { color: c.textSecondary }]}>İşaret levhaları, yol kuralları, kavşak, güvenlik</Text>
            </View>
            <Text style={[styles.infoValue, { color: c.primary }]}>{EXAM_TRAFIK} soru</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: c.border }]}>
            <View style={styles.infoLabelWrap}>
              <Text style={[styles.infoLabel, { color: c.textSecondary }]}>İlk Yardım Bilgisi</Text>
              <Text style={[styles.infoSublabel, { color: c.textSecondary }]}>Kalp masajı, kanama, kırık-çıkık, şok, taşıma</Text>
            </View>
            <Text style={[styles.infoValue, { color: c.primary }]}>{EXAM_ILK_YARDIM} soru</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: c.border }]}>
            <View style={styles.infoLabelWrap}>
              <Text style={[styles.infoLabel, { color: c.textSecondary }]}>Araç Tekniği ve Motor</Text>
              <Text style={[styles.infoSublabel, { color: c.textSecondary }]}>Motor, bakım, fren, yakıt-yağ, gösterge lambaları</Text>
            </View>
            <Text style={[styles.infoValue, { color: c.primary }]}>{EXAM_MOTOR} soru</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoLabelWrap}>
              <Text style={[styles.infoLabel, { color: c.textSecondary }]}>Trafik Adabı</Text>
              <Text style={[styles.infoSublabel, { color: c.textSecondary }]}>Empati, nezaket, sürüş ahlakı, kurallara uyum</Text>
            </View>
            <Text style={[styles.infoValue, { color: c.primary }]}>{EXAM_TRAFIK_ADABI} soru</Text>
          </View>
        </View>

        <View style={[styles.passCard, { backgroundColor: c.card, borderColor: c.border, ...getCardShadow(c) }]}>
          <Text style={[styles.passTitle, { color: c.text }]}>Geçme koşulu</Text>
          <Text style={[styles.passText, { color: c.textSecondary }]}>
            En az {EXAM_PASS_MIN_CORRECT} doğru ({EXAM_PASS_PERCENT} puan). Yanlış cevaplar doğruyu götürmez.
          </Text>
        </View>

        <View style={[styles.rightsCard, { backgroundColor: c.card, borderColor: c.border, ...getCardShadow(c) }]}>
          <Text style={[styles.rightsTitle, { color: c.text }]}>Sınav hakları</Text>
          <Text style={[styles.rightsText, { color: c.textSecondary }]}>
            Teorik: {EXAM_THEORY_ATTEMPTS} hak · Direksiyon: {EXAM_DRIVING_ATTEMPTS} hak. Tümü bitince dosya yanar, yeniden kurs gerekir.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: c.primary }]}
          onPress={() => router.push('/quiz' as never)}
          activeOpacity={0.8}>
          <MaterialIcons name="play-arrow" size={22} color={c.primaryContrast} />
          <Text style={[styles.buttonText, { color: c.primaryContrast }]}>Şimdi Başla</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  heroCard: {
    width: '100%',
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  heroSubtitle: { fontSize: 14 },
  infoCard: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoTitle: { fontSize: 15, fontWeight: '700', marginBottom: Spacing.sm },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  infoLabelWrap: { flex: 1, marginRight: Spacing.sm },
  infoLabel: { fontSize: 14, fontWeight: '600' },
  infoSublabel: { fontSize: 12, marginTop: 2, opacity: 0.85 },
  infoValue: { fontSize: 14, fontWeight: '600', flexShrink: 0 },
  passCard: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  passTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  passText: { fontSize: 13, lineHeight: 20 },
  rightsCard: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  rightsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  rightsText: { fontSize: 13, lineHeight: 20 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
});
