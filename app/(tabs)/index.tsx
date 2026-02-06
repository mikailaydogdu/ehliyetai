import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, Colors, getCardShadow, Spacing } from '@/constants/theme';
import { useExamDate } from '@/context/ExamDateContext';
import { useStats } from '@/context/StatsContext';
import { useWrongQuestions } from '@/context/WrongQuestionsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const APP_LOGO = require('@/assets/images/ehliyetai.png');

function formatExamDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export default function AnasayfaScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { examDate, daysLeft, setExamDate } = useExamDate();
  const { results } = useStats();
  const { wrongQuestions } = useWrongQuestions();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() =>
    examDate ? new Date(examDate) : new Date()
  );
  const [showDailyExamPopup, setShowDailyExamPopup] = useState(false);

  const openDatePicker = () => {
    setPickerDate(examDate ? new Date(examDate) : new Date());
    setShowDatePicker(true);
  };

  const onDatePickerChange = (_: unknown, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (date) {
      setPickerDate(date);
      if (Platform.OS === 'android') {
        setExamDate(date.toISOString().slice(0, 10));
      }
    }
  };

  const confirmDate = () => {
    setExamDate(pickerDate.toISOString().slice(0, 10));
    setShowDatePicker(false);
  };

  const clearDate = () => {
    setExamDate(null);
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <View style={styles.bannerRow}>
            <View style={styles.bannerLeft}>
              <Text style={[styles.bannerTitle, { color: c.text }]}>EhliyetAl'a hoş geldiniz</Text>
            </View>
            <View style={styles.bannerRight}>
              <Image source={APP_LOGO} style={styles.bannerLogo} resizeMode="contain" />
            </View>
          </View>
        </View>

        {/* Günün Sınavı */}
        <TouchableOpacity
          style={[styles.dailyCardOuter, getCardShadow(c)]}
          onPress={() => setShowDailyExamPopup(true)}
          activeOpacity={0.85}
          accessibilityLabel="Günün Sınavı"
          accessibilityHint="10 soruluk günlük deneme"
          accessibilityRole="button">
          <View style={[styles.dailyCard, { backgroundColor: c.primary }]}>
            <View style={[styles.dailyIconWrap, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <MaterialIcons name="quiz" size={32} color={c.primaryContrast} />
            </View>
            <View style={styles.dailyTextWrap}>
              <Text style={[styles.dailyTitle, { color: c.primaryContrast }]}>Günün Sınavı</Text>
              <Text style={[styles.dailySubtitle, { color: 'rgba(255,255,255,0.9)' }]}>
                10 soruluk günlük deneme. Her konudan sorular.
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={c.primaryContrast} />
          </View>
        </TouchableOpacity>

        {/* Sınav tarihi: tıklanınca takvim açılır */}
        <TouchableOpacity
          style={[styles.examDateRow, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}
          onPress={openDatePicker}
          activeOpacity={0.8}
          accessibilityLabel="Sınav tarihi"
          accessibilityHint="Tarih seçmek için dokunun"
          accessibilityRole="button">
          <MaterialIcons name="event" size={24} color={c.primary} />
          <View style={styles.examDateTextWrap}>
            <Text style={[styles.examDateLabel, { color: c.textSecondary }]}>Sınav tarihi</Text>
            <Text style={[styles.examDateValue, { color: c.text }]}>
              {examDate ? formatExamDate(examDate) : 'Tarih seçin'}
            </Text>
            {daysLeft !== null && examDate && (
              <Text style={[styles.examDateDays, { color: c.primary }]}>
                {daysLeft > 0 ? `Sınava ${daysLeft} gün kaldı` : daysLeft === 0 ? 'Sınav bugün!' : 'Sınav tarihi geçti'}
              </Text>
            )}
            <Text style={[styles.examDateHint, { color: c.textSecondary }]}>
              Seçmek için dokunun
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={c.textSecondary} />
        </TouchableOpacity>

        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={onDatePickerChange}
          />
        )}
        {showDatePicker && Platform.OS === 'ios' && (
          <View style={[styles.datePickerWrap, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display="spinner"
              minimumDate={new Date()}
              onChange={onDatePickerChange}
            />
            <View style={styles.datePickerActions}>
              <TouchableOpacity
                style={[styles.datePickerBtn, { borderColor: c.border }]}
                onPress={clearDate}
                activeOpacity={0.8}>
                <Text style={[styles.datePickerBtnText, { color: c.textSecondary }]}>Tarihi sil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.datePickerBtn, styles.datePickerBtnPrimary, { backgroundColor: c.primary }]}
                onPress={confirmDate}
                activeOpacity={0.8}>
                <Text style={[styles.datePickerBtnTextPrimary, { color: c.primaryContrast }]}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Yanlış Yapılan Sorular + Sınav Sonuçları - ikili */}
        <View style={styles.twinRow}>
          <TouchableOpacity
            style={[styles.twinCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}
            onPress={() => router.push('/yanlis-sorular' as never)}
            activeOpacity={0.85}
            accessibilityLabel="Yanlış Yapılan Sorular"
            accessibilityHint="Yanlış yaptığınız soruları tekrar çözün">
            <View style={[styles.twinIconWrap, { backgroundColor: c.selectedBg }]}>
              <MaterialIcons name="error-outline" size={26} color={c.primary} />
            </View>
            <Text style={[styles.twinTitle, { color: c.text }]}>Yanlış Sorular</Text>
            <Text style={[styles.twinSubtitle, { color: c.textSecondary }]} numberOfLines={2}>
              {wrongQuestions.length > 0
                ? `${wrongQuestions.length} soru`
                : 'Tekrar çöz'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.twinCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}
            onPress={() => router.push('/sinav-sonuclari' as never)}
            activeOpacity={0.85}
            accessibilityLabel="Sınav Sonuçları"
            accessibilityHint="Tüm sınav sonuçlarını listele">
            <View style={[styles.twinIconWrap, { backgroundColor: c.selectedBg }]}>
              <MaterialIcons name="emoji-events" size={26} color={c.primary} />
            </View>
            <Text style={[styles.twinTitle, { color: c.text }]}>Sınav Sonuçları</Text>
            <Text style={[styles.twinSubtitle, { color: c.textSecondary }]} numberOfLines={2}>
              {results.length > 0
                ? `${results.length} sonuç`
                : 'Sonuçları gör'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Günün Sınavı tıklanınca: reklam veya Pro üyelik popup */}
      <Modal
        visible={showDailyExamPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDailyExamPopup(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDailyExamPopup(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: c.card, borderColor: c.border }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>Sınava devam etmek için</Text>
              <TouchableOpacity onPress={() => setShowDailyExamPopup(false)} hitSlop={12} style={styles.modalClose}>
                <MaterialIcons name="close" size={24} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: c.textSecondary }]}>
              Reklam izleyerek ücretsiz devam edebilir veya Pro üyelik ile reklamsız kullanın.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: c.primary }]}
              onPress={() => {
                setShowDailyExamPopup(false);
                router.push({ pathname: '/sinav-baslangic', params: { daily: '1' } } as never);
              }}
              activeOpacity={0.8}>
              <MaterialIcons name="play-circle-outline" size={22} color={c.primaryContrast} />
              <Text style={[styles.modalBtnText, { color: c.primaryContrast }]}>Reklam izle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnOutline, { borderColor: c.border }]}
              onPress={() => {
                setShowDailyExamPopup(false);
                router.push('/pro-uyelik' as never);
              }}
              activeOpacity={0.8}>
              <MaterialIcons name="star" size={22} color={c.primary} />
              <Text style={[styles.modalBtnTextOutline, { color: c.text }]}>Pro üyelik</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelWrap}
              onPress={() => setShowDailyExamPopup(false)}
              activeOpacity={0.7}>
              <Text style={[styles.modalCancel, { color: c.textSecondary }]}>İptal</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  heroBlock: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: { flex: 1, paddingRight: Spacing.md, justifyContent: 'center' },
  bannerTitle: { fontSize: 20, fontWeight: '700' },
  bannerRight: { justifyContent: 'center', alignItems: 'center' },
  bannerLogo: { width: 80, height: 80 },
  examDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  examDateTextWrap: { flex: 1, marginLeft: Spacing.md },
  examDateLabel: { fontSize: 12, marginBottom: 2 },
  examDateValue: { fontSize: 16, fontWeight: '600' },
  examDateDays: { fontSize: 13, marginTop: 2, fontWeight: '500' },
  examDateHint: { fontSize: 12, marginTop: 4, opacity: 0.85 },
  dailyCardOuter: {
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 0,
  },
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    minHeight: 88,
    overflow: 'hidden',
  },
  dailyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dailyTextWrap: { flex: 1, minWidth: 0 },
  dailyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  dailySubtitle: { fontSize: 13, lineHeight: 18 },
  twinRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  twinCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 120,
  },
  twinIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  twinTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  twinSubtitle: { fontSize: 12, lineHeight: 16, textAlign: 'center' },
  datePickerWrap: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  datePickerActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  datePickerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  datePickerBtnPrimary: { borderWidth: 0 },
  datePickerBtnText: { fontSize: 15, fontWeight: '600' },
  datePickerBtnTextPrimary: { fontSize: 15, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  modalClose: { padding: 4 },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  modalBtnPrimary: {},
  modalBtnOutline: { backgroundColor: 'transparent', borderWidth: 1 },
  modalBtnText: { fontSize: 16, fontWeight: '600' },
  modalBtnTextOutline: { fontSize: 16, fontWeight: '600' },
  modalCancelWrap: { alignItems: 'center', paddingTop: Spacing.sm },
  modalCancel: { fontSize: 15, fontWeight: '500' },
});
