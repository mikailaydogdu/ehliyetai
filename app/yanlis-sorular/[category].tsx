import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius, TOUCH_TARGET_MIN } from '@/constants/theme';
import { useWrongQuestions } from '@/context/WrongQuestionsContext';
import { submitQuestionReport, type ReportReason } from '@/lib/firebase';
import type { SavedWrongQuestion } from '@/types';
import { getQuestionImageSource } from '@/data/tabelaImages';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'soru_yanlis', label: 'Soru yanlış' },
  { value: 'soru_hatali', label: 'Soru hatalı' },
  { value: 'cevap_yanlis', label: 'Cevap yanlış' },
  { value: 'cevap_yanlis_isaretlenmis', label: 'Cevap yanlış işaretlenmiş' },
  { value: 'diger', label: 'Diğer' },
];

export default function YanlisSorularCategoryScreen() {
  const { category, categoryName } = useLocalSearchParams<{ category: string; categoryName?: string }>();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { wrongQuestions, removeWrongQuestion } = useWrongQuestions();
  const [showQuestionMenu, setShowQuestionMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason | null>(null);
  const questionCardRef = useRef<View>(null);

  const questionsToReview = useMemo(
    () => wrongQuestions.filter((q) => q.categoryId === category),
    [wrongQuestions, category]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedIndex(null);
  }, [category]);

  const q = questionsToReview[currentIndex];
  const total = questionsToReview.length;
  const hasAnswered = selectedIndex !== null;
  const correct = q && selectedIndex === q.correctIndex;
  const title = categoryName ?? category;

  const handleSelectOption = (optionIndex: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(optionIndex);
  };

  const handleNext = () => {
    const wasCorrect = q && selectedIndex === q.correctIndex;
    if (wasCorrect) {
      removeWrongQuestion(q.questionId);
      setSelectedIndex(null);
      // Liste güncellenince aynı index bir sonraki soruyu gösterir; index değiştirme
    } else {
      setSelectedIndex(null);
      if (currentIndex >= questionsToReview.length - 1) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }
  };

  if (questionsToReview.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Geri"
            accessibilityHint="Önceki sayfaya dön">
            <MaterialIcons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>{title}</Text>
        </View>
        <View style={styles.emptyWrap}>
          <MaterialIcons name="check-circle" size={64} color={c.success} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>Bu kategoride yanlış soru kalmadı</Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: c.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.8}>
            <Text style={[styles.backButtonText, { color: c.primaryContrast }]}>Kategorilere dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!q) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyTitle, { color: c.text }]}>Tamamlandı</Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: c.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.8}>
            <Text style={[styles.backButtonText, { color: c.primaryContrast }]}>Kategorilere dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Geri"
          accessibilityHint="Önceki sayfaya dön">
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>
          {currentIndex + 1} / {total}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerMenuBtn}
            onPress={() => setShowQuestionMenu(true)}
            hitSlop={12}
            accessibilityLabel="Menü"
            accessibilityHint="Paylaş veya bildir">
            <MaterialIcons name="more-vert" size={24} color={c.text} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.progressBarBg, { backgroundColor: c.border }]}>
        <View
          style={[
            styles.progressBarFill,
            { backgroundColor: c.primary, width: `${total > 0 ? ((currentIndex + 1) / total) * 100 : 0}%` },
          ]}
        />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View
          ref={questionCardRef}
          style={[styles.questionBlock, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}
          collapsable={false}>
          {q.imageCode && getQuestionImageSource(q.imageCode) && (
            <View style={styles.signImageWrap}>
              <Image
                source={getQuestionImageSource(q.imageCode)!}
                style={styles.signImage}
                resizeMode="contain"
              />
            </View>
          )}
          <Text style={[styles.questionText, { color: c.text }]}>{q.questionText}</Text>
          <View style={styles.options}>
            {q.options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrect = idx === q.correctIndex;
              const showResult = hasAnswered;
              const optImg = q.optionImages?.[idx];
              const optImgSource = optImg ? getQuestionImageSource(optImg) : undefined;
              const bg =
                showResult && isCorrect
                  ? c.success + '20'
                  : isSelected && !correct
                    ? c.error + '20'
                    : c.card;
              const border =
                showResult && isCorrect ? c.success : isSelected && !correct ? c.error : c.border;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    optImgSource ? styles.optionWithImage : styles.option,
                    { backgroundColor: bg, borderColor: border },
                  ]}
                  onPress={() => handleSelectOption(idx)}
                  disabled={hasAnswered}
                  activeOpacity={0.7}>
                  {optImgSource ? (
                    <View style={styles.optionImageRow}>
                      <Text style={[styles.optionLabel, { color: c.text }]}>{['A', 'B', 'C', 'D'][idx]})</Text>
                      <Image source={optImgSource} style={styles.optionImage} resizeMode="contain" />
                    </View>
                  ) : (
                    <Text style={[styles.optionText, { color: c.text }]}>
                      {['A', 'B', 'C', 'D'][idx]}) {opt}
                    </Text>
                  )}
                  {showResult && isCorrect && (
                    <MaterialIcons name="check-circle" size={22} color={c.success} />
                  )}
                  {isSelected && !correct && idx === selectedIndex && (
                    <MaterialIcons name="cancel" size={22} color={c.error} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {hasAnswered && (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: c.primary }]}
            onPress={handleNext}
            activeOpacity={0.8}>
            <Text style={[styles.nextBtnText, { color: c.primaryContrast }]}>Sonraki</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal
        visible={showQuestionMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuestionMenu(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setShowQuestionMenu(false)}>
          <View style={[styles.questionMenuCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <TouchableOpacity
              style={[styles.questionMenuItem, { borderBottomColor: c.border }]}
              onPress={() => {
                setShowQuestionMenu(false);
                setTimeout(() => {
                  const node = questionCardRef.current;
                  if (!node) return;
                  const fileUri = (uri: string) =>
                    uri.startsWith('file://') ? uri : 'file://' + uri;
                  captureRef(node, { format: 'jpg', result: 'tmpfile', quality: 1 })
                    .then(async (uri) => {
                      const normalized = fileUri(uri);
                      const canShare = await Sharing.isAvailableAsync();
                      if (canShare) {
                        await Sharing.shareAsync(normalized, { mimeType: 'image/jpeg' });
                      } else {
                        await Share.share({ message: q?.questionText ?? '', url: normalized });
                      }
                    })
                    .catch(() => Share.share({ message: q?.questionText ?? '' }));
                }, 400);
              }}
              activeOpacity={0.7}>
              <MaterialIcons name="share" size={22} color={c.text} />
              <Text style={[styles.questionMenuItemText, { color: c.text }]}>Paylaş</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.questionMenuItem, { borderBottomColor: c.border }]}
              onPress={() => {
                setShowQuestionMenu(false);
                setShowReportModal(true);
                setReportReason(null);
              }}
              activeOpacity={0.7}>
              <MaterialIcons name="flag" size={22} color={c.text} />
              <Text style={[styles.questionMenuItemText, { color: c.text }]}>Bildir</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setShowReportModal(false)}>
          <Pressable
            style={[styles.reportModalCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}
            onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.reportModalTitle, { color: c.text }]}>Bildir</Text>
            <Text style={[styles.reportModalSubtitle, { color: c.textSecondary }]}>
              Soruyu neden bildirmek istiyorsunuz?
            </Text>
            {REPORT_REASONS.map(({ value, label }) => (
              <TouchableOpacity
                key={value}
                style={[styles.reportReasonRow, { borderBottomColor: c.border }]}
                onPress={() => setReportReason(value)}
                activeOpacity={0.7}>
                <Text style={[styles.reportReasonLabel, { color: c.text }]}>{label}</Text>
                {reportReason === value && (
                  <MaterialIcons name="check" size={24} color={c.primary} />
                )}
              </TouchableOpacity>
            ))}
            <View style={styles.reportModalButtons}>
              <TouchableOpacity
                style={[styles.reportModalBtn, { borderColor: c.border }]}
                onPress={() => setShowReportModal(false)}
                activeOpacity={0.8}>
                <Text style={[styles.reportModalBtnText, { color: c.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reportModalBtn, styles.reportModalBtnPrimary, { backgroundColor: c.primary }]}
                onPress={() => {
                  if (!reportReason || !q) return;
                  submitQuestionReport({
                    questionId: q.questionId,
                    reason: reportReason,
                    questionText: q.questionText,
                    categoryId: q.categoryId,
                  })
                    .then(() => {
                      setShowReportModal(false);
                      setReportReason(null);
                      Alert.alert('Teşekkürler', 'Bildiriminiz alındı.');
                    })
                    .catch(() => Alert.alert('Hata', 'Bildirim gönderilemedi. Tekrar deneyin.'));
                }}
                disabled={!reportReason}
                activeOpacity={0.8}>
                <Text style={[styles.reportModalBtnTextPrimary, { color: c.primaryContrast }]}>Bildir</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  headerTitle: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center' },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 100,
    justifyContent: 'flex-end',
  },
  headerMenuBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  questionMenuCard: {
    minWidth: 200,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  questionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  questionMenuItemText: { fontSize: 16, fontWeight: '600' },
  reportModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  reportModalTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.xs },
  reportModalSubtitle: { fontSize: 14, marginBottom: Spacing.md },
  reportReasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  reportReasonLabel: { fontSize: 16 },
  reportModalButtons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  reportModalBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  reportModalBtnPrimary: { borderWidth: 0 },
  reportModalBtnText: { fontSize: 16, fontWeight: '600' },
  reportModalBtnTextPrimary: { fontSize: 16, fontWeight: '600' },
  progressBarBg: { height: 4, width: '100%' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm, textAlign: 'center' },
  backButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xl },
  questionBlock: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  signImageWrap: { width: '100%', alignItems: 'center', marginBottom: Spacing.sm },
  signImage: { width: '100%', height: 220, borderRadius: BorderRadius.sm },
  questionText: { fontSize: 16, fontWeight: '600', lineHeight: 22, marginBottom: Spacing.md },
  options: { gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionWithImage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  optionLabel: { fontSize: 15, fontWeight: '600' },
  optionImage: { width: 80, height: 60 },
  optionText: { fontSize: 15, flex: 1 },
  nextBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  nextBtnText: { fontSize: 17, fontWeight: '600' },
});
