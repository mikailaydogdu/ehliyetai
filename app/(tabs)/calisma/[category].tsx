import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

import { BorderRadius, Colors, getCardShadow, Spacing, TOUCH_TARGET_MIN } from '@/constants/theme';
import { useContent } from '@/context/ContentContext';
import { useStats } from '@/context/StatsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getQuestionImageSource } from '@/data/tabelaImages';
import { shuffleArray } from '@/data/mockData';
import { generateWrongExplanation } from '@/lib/groq';
import { submitQuestionReport, type ReportReason } from '@/lib/firebase';
import type { Question, WrongAnswer } from '@/types';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'soru_yanlis', label: 'Soru yanlış' },
  { value: 'soru_hatali', label: 'Soru hatalı' },
  { value: 'cevap_yanlis', label: 'Cevap yanlış' },
  { value: 'cevap_yanlis_isaretlenmis', label: 'Cevap yanlış işaretlenmiş' },
  { value: 'diger', label: 'Diğer' },
];

const PRACTICE_COUNT = 15;
const CATEGORY_TO_SOURCE: Record<string, string> = { kurallar: 'trafik', bakim: 'motor' };

export default function CalismaCategoryScreen() {
  /** category param: virgülle ayrılmış kategori ID'leri (ör. "trafik,ilkyardim,motor") */
  const { category } = useLocalSearchParams<{ category: string }>();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const { categories, questions: allQuestions, isContentLoading } = useContent();
  const { addResult } = useStats();

  const categoryIds = (category ?? '').split(',').filter(Boolean);
  const displayName = categoryIds.length > 2
    ? `${categoryIds.length} kategori`
    : categoryIds.map((id) => categories.find((cat) => cat.id === id)?.name ?? id).join(', ');

  const [sessionKey, setSessionKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answersByIndex, setAnswersByIndex] = useState<Record<number, number>>({});
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState(false);
  const [showQuestionMenu, setShowQuestionMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason | null>(null);
  const [visibleResultQuestions, setVisibleResultQuestions] = useState(10);
  const questionCardRef = useRef<View>(null);

  /** Seçilen kategorilerden 15 karışık soru */
  const questions: Question[] = useMemo(() => {
    if (isContentLoading) return [];
    const sourceIds = new Set(categoryIds.map((id) => CATEGORY_TO_SOURCE[id] ?? id));
    const pool = allQuestions.filter((q) => sourceIds.has(q.categoryId));
    return shuffleArray(pool).slice(0, PRACTICE_COUNT);
  }, [category, sessionKey, isContentLoading]);

  const total = questions.length;
  const q = questions[currentIndex];
  const hasAnswered = selectedIndex !== null;
  const isCorrect = q && selectedIndex === q.correctIndex;
  const isLast = currentIndex >= total - 1;

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setAnswersByIndex({});
    setCorrectCount(0);
    setFinished(false);
    setExplanation(null);
    setLoadingExplanation(false);
    setExplanationError(false);
    setVisibleResultQuestions(10);
  }, [sessionKey]);

  const handleSelectOption = (optionIndex: number) => {
    if (hasAnswered) return;
    setSelectedIndex(optionIndex);
    setAnswersByIndex((prev) => ({ ...prev, [currentIndex]: optionIndex }));
    setExplanation(null);
    setExplanationError(false);
    if (q && optionIndex === q.correctIndex) {
      setCorrectCount((c) => c + 1);
      return;
    }
    if (q && optionIndex !== q.correctIndex) {
      if (q.explanation) {
        setExplanation(q.explanation);
        return;
      }
      setLoadingExplanation(true);
      generateWrongExplanation(q.text, q.options, optionIndex, q.correctIndex)
        .then((text) => {
          setExplanation(text);
          setExplanationError(false);
        })
        .catch(() => {
          setExplanation(null);
          setExplanationError(true);
        })
        .finally(() => setLoadingExplanation(false));
    }
  };

  const retryExplanation = useCallback(() => {
    if (!q || selectedIndex === null) return;
    setLoadingExplanation(true);
    setExplanationError(false);
    generateWrongExplanation(q.text, q.options, selectedIndex, q.correctIndex)
      .then((text) => setExplanation(text))
      .catch(() => setExplanationError(true))
      .finally(() => setLoadingExplanation(false));
  }, [q, selectedIndex]);

  const buildWrongAnswersFromAnswers = useCallback(
    (ans: Record<number, number>, qs: Question[]): WrongAnswer[] => {
      const wrong: WrongAnswer[] = [];
      qs.forEach((question, i) => {
        const sel = ans[i];
        if (sel === undefined || sel === question.correctIndex) return;
        const categoryName = categories.find((c) => c.id === question.categoryId)?.name ?? question.categoryId;
        wrong.push({
          questionId: question.id,
          questionText: question.text,
          categoryId: question.categoryId,
          categoryName,
          selectedIndex: sel,
          correctIndex: question.correctIndex,
          options: question.options,
          imageCode: question.imageCode,
          optionImages: question.optionImages,
        });
      });
      return wrong;
    },
    [categories]
  );

  const handleNext = () => {
    setSelectedIndex(null);
    setExplanation(null);
    setLoadingExplanation(false);
    setExplanationError(false);
    if (isLast) {
      const wrongAnswers = buildWrongAnswersFromAnswers(answersByIndex, questions);
      addResult(correctCount, total, wrongAnswers, displayName);
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
  };

  const restart = () => {
    setSessionKey((k) => k + 1);
  };

  /* ─── Sonuç ekranı ─── */
  if (finished) {
    const puan = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
        <ScrollView
          contentContainerStyle={[styles.resultContent, { paddingBottom: insets.bottom + Spacing.xl }]}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.resultCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
            <Text style={[styles.resultTitle, { color: c.text }]}>{displayName}</Text>
            <Text style={[styles.resultScore, { color: c.primary }]}>
              {correctCount} / {total} doğru
            </Text>
            <Text style={[styles.resultPuan, { color: c.primary }]}>{puan} puan</Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: c.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.8}>
            <Text style={[styles.primaryBtnText, { color: c.primaryContrast }]}>Bitir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: c.border }]}
            onPress={restart}
            activeOpacity={0.8}>
            <Text style={[styles.outlineBtnText, { color: c.text }]}>Tekrar</Text>
          </TouchableOpacity>

          {/* Tüm sorular: önce 10, "Daha fazla" ile 10'ar */}
          {questions.length > 0 && (
            <View style={styles.resultQuestionsWrap}>
              <Text style={[styles.resultSectionTitle, { color: c.text }]}>Tüm sorular</Text>
              {questions.slice(0, visibleResultQuestions).map((question, i) => {
                const sel = answersByIndex[i] ?? undefined;
                const isCorrect = sel !== undefined && sel === question.correctIndex;
                return (
                  <View
                    key={`${question.id}-${i}`}
                    style={[styles.resultQuestionCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
                    <View style={styles.resultQuestionHeader}>
                      <Text style={[styles.resultQuestionNum, { color: c.textSecondary }]}>Soru {i + 1}</Text>
                      <View
                        style={[
                          styles.resultQuestionBadge,
                          { backgroundColor: isCorrect ? (c.success + '20') : (c.error + '20'), borderColor: isCorrect ? c.success : c.error },
                        ]}>
                        <MaterialIcons
                          name={isCorrect ? 'check-circle' : 'cancel'}
                          size={18}
                          color={isCorrect ? c.success : c.error}
                        />
                        <Text style={[styles.resultQuestionBadgeText, { color: isCorrect ? c.success : c.error }]}>
                          {isCorrect ? 'Doğru' : 'Yanlış'}
                        </Text>
                      </View>
                    </View>
                    {question.imageCode && getQuestionImageSource(question.imageCode) && (
                      <View style={styles.resultQuestionImageWrap}>
                        <Image
                          source={getQuestionImageSource(question.imageCode)!}
                          style={styles.resultQuestionImage}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                    <Text style={[styles.resultQuestionText, { color: c.text }]}>{question.text}</Text>
                    <View style={styles.resultQuestionOptions}>
                      {question.options.map((opt, idx) => {
                        const isCorrectOption = idx === question.correctIndex;
                        const isUserWrongChoice = sel !== undefined && idx === sel && !isCorrect;
                        const bg = isCorrectOption
                          ? c.success + '20'
                          : isUserWrongChoice
                            ? c.error + '20'
                            : 'transparent';
                        const border = isCorrectOption ? c.success : isUserWrongChoice ? c.error : c.border;
                        const optImg = question.optionImages?.[idx];
                        const optImgSource = optImg ? getQuestionImageSource(optImg) : undefined;
                        return (
                          <View
                            key={idx}
                            style={[
                              optImgSource ? styles.resultOptionWithImage : styles.resultOptionRow,
                              { backgroundColor: bg, borderColor: border },
                            ]}>
                            {optImgSource ? (
                              <View style={styles.resultOptionImageRow}>
                                <Text style={[styles.resultOptionLabel, { color: c.text }]}>
                                  {['A', 'B', 'C', 'D'][idx]})
                                </Text>
                                <Image source={optImgSource} style={styles.resultOptionImage} resizeMode="contain" />
                              </View>
                            ) : (
                              <Text style={[styles.resultOptionText, { color: c.text }]}>
                                {['A', 'B', 'C', 'D'][idx]}) {opt}
                              </Text>
                            )}
                            {isCorrectOption && <MaterialIcons name="check-circle" size={20} color={c.success} />}
                            {isUserWrongChoice && <MaterialIcons name="cancel" size={20} color={c.error} />}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
              {questions.length > visibleResultQuestions && (
                <TouchableOpacity
                  style={[styles.resultLoadMoreBtn, { borderColor: c.border }]}
                  onPress={() => setVisibleResultQuestions((n) => n + 10)}
                  activeOpacity={0.7}>
                  <Text style={[styles.resultLoadMoreText, { color: c.primary }]}>Daha fazla</Text>
                  <MaterialIcons name="expand-more" size={24} color={c.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ─── Soru yok ─── */
  if (total === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
        <View style={styles.centered}>
          <MaterialIcons name="quiz" size={48} color={c.textSecondary} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>Bu kategoride soru yok</Text>
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

  /* ─── Soru ekranı ─── */
  const imgSrc = q.imageCode ? getQuestionImageSource(q.imageCode) : undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      {/* Header: quiz ile aynı (geri, 1/10, doğru sayısı, 3 nokta) */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>
          {currentIndex + 1} / {total}
        </Text>
        <View style={styles.headerRight}>
          <View style={styles.headerCorrectWrap}>
            <MaterialIcons name="check-circle" size={18} color={c.success} />
            <Text style={[styles.headerCorrectText, { color: c.success }]}>{correctCount} doğru</Text>
          </View>
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

      {/* Progress bar: quiz ile aynı */}
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        {/* Kart: paylaş için ref ile sarıyoruz */}
        <View
          ref={questionCardRef}
          style={[styles.optionsCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}
          collapsable={false}>
        {/* Soru görseli */}
        {imgSrc && (
          <View style={styles.imageWrap}>
            <Image source={imgSrc} style={styles.questionImage} resizeMode="contain" />
          </View>
        )}

        <Text style={[styles.questionText, { color: c.text }]}>{q.text}</Text>

        {/* Şıklar */}
        <View style={styles.optionsInner}>
          {q.options.map((opt, idx) => {
            const isSel = selectedIndex === idx;
            const isCor = idx === q.correctIndex;
            const optImg = q.optionImages?.[idx];
            const optImgSrc = optImg ? getQuestionImageSource(optImg) : undefined;

            const bg = hasAnswered && isCor
              ? c.success + '20'
              : hasAnswered && isSel && !isCorrect
                ? c.error + '20'
                : isSel ? c.selectedBg : c.card;
            const border = hasAnswered && isCor
              ? c.success
              : hasAnswered && isSel && !isCorrect
                ? c.error
                : isSel ? c.primary : c.border;

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  optImgSrc ? styles.optionWithImg : styles.option,
                  { backgroundColor: bg, borderColor: border },
                ]}
                onPress={() => handleSelectOption(idx)}
                disabled={hasAnswered}
                activeOpacity={0.7}>
                {optImgSrc ? (
                  <View style={styles.optImgRow}>
                    <Text style={[styles.optLabel, { color: c.text }]}>{['A', 'B', 'C', 'D'][idx]})</Text>
                    <Image source={optImgSrc} style={styles.optImg} resizeMode="contain" />
                  </View>
                ) : (
                  <Text style={[styles.optionText, { color: c.text }]}>
                    {['A', 'B', 'C', 'D'][idx]}) {opt}
                  </Text>
                )}
                {hasAnswered && isCor && <MaterialIcons name="check-circle" size={22} color={c.success} />}
                {hasAnswered && isSel && !isCorrect && <MaterialIcons name="cancel" size={22} color={c.error} />}
              </TouchableOpacity>
            );
          })}
        </View>
        </View>

        {/* Yanlış cevapta açıklama */}
        {hasAnswered && !isCorrect && (
          <View style={[styles.explanationCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.explanationTitle, { color: c.text }]}>Açıklama</Text>
            {loadingExplanation && (
              <View style={styles.explanationLoading}>
                <ActivityIndicator size="small" color={c.primary} />
                <Text style={[styles.explanationLoadingText, { color: c.textSecondary }]}>EhliyetAI düşünüyor…</Text>
              </View>
            )}
            {explanationError && !loadingExplanation && (
              <View style={styles.explanationError}>
                <Text style={[styles.explanationErrorText, { color: c.textSecondary }]}>Açıklama yüklenemedi.</Text>
                <TouchableOpacity style={[styles.retryBtn, { borderColor: c.primary }]} onPress={retryExplanation} activeOpacity={0.8}>
                  <Text style={[styles.retryBtnText, { color: c.primary }]}>Tekrar dene</Text>
                </TouchableOpacity>
              </View>
            )}
            {explanation && !loadingExplanation && (
              <Text style={[styles.explanationText, { color: c.text }]}>{explanation}</Text>
            )}
          </View>
        )}

        {/* İleri butonu: doğru cevapta hemen, yanlışta açıklama yüklendikten veya hata sonrası */}
        {hasAnswered && (isCorrect || explanation !== null || explanationError) && (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: c.primary }]}
            onPress={handleNext}
            activeOpacity={0.8}>
            <Text style={[styles.nextBtnText, { color: c.primaryContrast }]}>
              {isLast ? 'Sonuçları gör' : 'Sonraki soru'}
            </Text>
            <MaterialIcons name="chevron-right" size={22} color={c.primaryContrast} />
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
              onPress={async () => {
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
                        await Share.share({ message: q?.text ?? '', url: normalized });
                      }
                    })
                    .catch(() => Share.share({ message: q?.text ?? '' }));
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
                    questionId: q.id,
                    reason: reportReason,
                    questionText: q.text,
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.lg },

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
  headerCorrectWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerCorrectText: { fontSize: 14, fontWeight: '600' },
  headerMenuBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
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

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },

  imageWrap: { width: '100%', alignItems: 'center', marginBottom: Spacing.sm },
  questionImage: { width: '100%', height: 220, borderRadius: BorderRadius.sm },
  questionText: { fontSize: 16, fontWeight: '600', lineHeight: 22, marginBottom: Spacing.lg },

  optionsCard: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.md },
  optionsInner: { gap: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: Spacing.md, borderRadius: 10, borderWidth: 1,
  },
  optionWithImg: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, paddingHorizontal: Spacing.sm, borderRadius: 10, borderWidth: 1,
  },
  optImgRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.sm },
  optLabel: { fontSize: 15, fontWeight: '600' },
  optImg: { width: 80, height: 60 },
  optionText: { fontSize: 15, flex: 1 },

  explanationCard: {
    padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.md,
  },
  explanationTitle: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  explanationLoading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: Spacing.sm },
  explanationLoadingText: { fontSize: 15 },
  explanationError: { gap: 8 },
  explanationErrorText: { fontSize: 15 },
  retryBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: Spacing.md, borderRadius: 8, borderWidth: 1 },
  retryBtnText: { fontSize: 15, fontWeight: '600' },
  explanationText: { fontSize: 15, lineHeight: 22 },

  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 16, borderRadius: 12,
  },
  nextBtnText: { fontSize: 17, fontWeight: '600' },

  resultContent: { padding: Spacing.lg, paddingTop: Spacing.xl, alignItems: 'center' },
  resultCard: {
    padding: Spacing.xl, borderRadius: BorderRadius.xl, borderWidth: 1,
    alignItems: 'center', marginBottom: Spacing.lg, width: '100%',
  },
  resultTitle: { fontSize: 18, fontWeight: '600', marginBottom: Spacing.sm },
  resultScore: { fontSize: 32, fontWeight: '700', marginBottom: Spacing.sm },
  resultPuan: { fontSize: 20, fontWeight: '700' },
  resultQuestionsWrap: { width: '100%', marginTop: Spacing.lg, marginBottom: Spacing.md },
  resultSectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md, paddingHorizontal: Spacing.sm },
  resultLoadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  resultLoadMoreText: { fontSize: 16, fontWeight: '600' },
  resultQuestionCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  resultQuestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  resultQuestionNum: { fontSize: 14, fontWeight: '600' },
  resultQuestionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  resultQuestionBadgeText: { fontSize: 14, fontWeight: '700' },
  resultQuestionImageWrap: { alignItems: 'center', marginBottom: Spacing.sm },
  resultQuestionImage: { width: 120, height: 100, borderRadius: BorderRadius.sm },
  resultQuestionText: { fontSize: 15, fontWeight: '600', lineHeight: 22, marginBottom: Spacing.md },
  resultQuestionOptions: { gap: 8 },
  resultOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
  },
  resultOptionWithImage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
  },
  resultOptionText: { fontSize: 15, flex: 1 },
  resultOptionLabel: { fontSize: 15, fontWeight: '600', marginRight: Spacing.sm },
  resultOptionImageRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  resultOptionImage: { width: 72, height: 56, borderRadius: 8 },
  primaryBtn: {
    paddingVertical: 14, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.md,
    alignSelf: 'stretch', alignItems: 'center',
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700' },
  outlineBtn: {
    paddingVertical: 14, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.md,
    borderWidth: 1, marginTop: Spacing.md, alignSelf: 'stretch', alignItems: 'center',
  },
  outlineBtnText: { fontSize: 17, fontWeight: '600' },
});
