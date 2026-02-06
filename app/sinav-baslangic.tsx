import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';

import { BorderRadius, Colors, getCardShadow, Spacing, TOUCH_TARGET_MIN } from '@/constants/theme';
import {
  EXAM_DRIVING_ATTEMPTS,
  EXAM_DURATION_MINUTES,
  EXAM_ILK_YARDIM,
  EXAM_MOTOR,
  EXAM_PASS_MIN_CORRECT,
  EXAM_PASS_PERCENT,
  EXAM_THEORY_ATTEMPTS,
  EXAM_TOTAL_QUESTIONS,
  EXAM_TRAFIK,
  EXAM_TRAFIK_ADABI,
} from '@/data/mockData';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DAILY_QUESTIONS = 10;
const DAILY_MINUTES = 10;

export default function SinavBaslangicScreen() {
  const { fullExam, daily } = useLocalSearchParams<{ fullExam?: string; daily?: string }>();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  const isDaily = daily === '1';
  const examNum = fullExam ? parseInt(fullExam, 10) : 1;
  const isFullExamValid = examNum >= 1 && examNum <= 20;
  const isValid = isDaily || isFullExamValid;

  const handleStart = () => {
    if (isDaily) {
      router.replace({ pathname: '/quiz', params: { daily: '1' } } as never);
      return;
    }
    if (isFullExamValid) {
      router.replace({ pathname: '/quiz', params: { fullExam: String(examNum) } } as never);
    }
  };

  if (!isValid) {
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
          <Text style={[styles.headerTitle, { color: c.text }]}>Sınav Başlangıç</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>Geçersiz sınav numarası.</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: c.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.8}>
            <Text style={[styles.primaryBtnText, { color: c.primaryContrast }]}>Geri dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={[styles.headerTitle, { color: c.text }]}>
          {isDaily ? 'Günün Sınavı' : `Sınav ${examNum}`}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: c.primary }]}>
          <View style={[styles.heroIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <MaterialIcons name="quiz" size={40} color={c.primaryContrast} />
          </View>
          <Text style={[styles.heroTitle, { color: c.primaryContrast }]}>
            {isDaily ? 'Günün Sınavı' : 'B Sınıfı Ehliyet Sınavı'}
          </Text>
          <Text style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>
            {isDaily
              ? `${DAILY_QUESTIONS} soru · ${DAILY_MINUTES} dakika`
              : `${EXAM_TOTAL_QUESTIONS} soru · ${EXAM_DURATION_MINUTES} dakika`}
          </Text>
        </View>

        {isDaily ? (
          <View
            style={[
              styles.passCard,
              { backgroundColor: c.card, borderColor: c.border, ...getCardShadow(c) },
            ]}>
            <Text style={[styles.passText, { color: c.textSecondary }]}>
              Her kategoriden karışık 10 soru. Doğru ve yanlış cevaplar anında gösterilir.
            </Text>
          </View>
        ) : (
          <>
            <View
              style={[
                styles.infoCard,
                {
                  ...getCardShadow(c),
                  backgroundColor: c.card,
                  borderColor: c.border,
                },
              ]}>
              <Text style={[styles.infoTitle, { color: c.text }]}>Soru dağılımı</Text>
              <View style={[styles.infoRow, { borderBottomColor: c.border }]}>
                <Text style={[styles.infoLabel, { color: c.textSecondary }]}>Trafik ve Çevre Bilgisi</Text>
                <Text style={[styles.infoValue, { color: c.primary }]}>{EXAM_TRAFIK} soru</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomColor: c.border }]}>
                <Text style={[styles.infoLabel, { color: c.textSecondary }]}>İlk Yardım Bilgisi</Text>
                <Text style={[styles.infoValue, { color: c.primary }]}>{EXAM_ILK_YARDIM} soru</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomColor: c.border }]}>
                <Text style={[styles.infoLabel, { color: c.textSecondary }]}>Araç Tekniği ve Motor</Text>
                <Text style={[styles.infoValue, { color: c.primary }]}>{EXAM_MOTOR} soru</Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.infoLabel, { color: c.textSecondary }]}>Trafik Adabı</Text>
                <Text style={[styles.infoValue, { color: c.primary }]}>{EXAM_TRAFIK_ADABI} soru</Text>
              </View>
            </View>

            <View
              style={[
                styles.passCard,
                { backgroundColor: c.card, borderColor: c.border, ...getCardShadow(c) },
              ]}>
              <Text style={[styles.passTitle, { color: c.text }]}>Geçme koşulu</Text>
              <Text style={[styles.passText, { color: c.textSecondary }]}>
                En az {EXAM_PASS_MIN_CORRECT} doğru ({EXAM_PASS_PERCENT} puan). Yanlış cevaplar doğruyu götürmez.
              </Text>
            </View>

            <View
              style={[
                styles.rightsCard,
                { backgroundColor: c.card, borderColor: c.border, ...getCardShadow(c) },
              ]}>
              <Text style={[styles.rightsTitle, { color: c.text }]}>Sınav hakları</Text>
              <Text style={[styles.rightsText, { color: c.textSecondary }]}>
                Teorik: {EXAM_THEORY_ATTEMPTS} hak · Direksiyon: {EXAM_DRIVING_ATTEMPTS} hak. Tümü bitince dosya yanar, yeniden kurs gerekir.
              </Text>
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: c.primary }]}
          onPress={handleStart}
          activeOpacity={0.8}>
          <MaterialIcons name="play-arrow" size={24} color={c.primaryContrast} />
          <Text style={[styles.startButtonText, { color: c.primaryContrast }]}>Sınava Başla</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  backBtn: {
    minWidth: TOUCH_TARGET_MIN,
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
    marginLeft: -Spacing.sm,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', marginLeft: Spacing.sm },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl + 32 },
  heroCard: {
    width: '100%',
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
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
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
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
    marginBottom: Spacing.xl,
  },
  rightsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  rightsText: { fontSize: 13, lineHeight: 20 },
  startButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
  },
  startButtonText: { fontSize: 17, fontWeight: '700' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyText: { fontSize: 15, marginBottom: Spacing.lg },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.md,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '600' },
});
