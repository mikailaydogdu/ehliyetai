import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, Colors, getCardShadow, Spacing } from '@/constants/theme';
import { useContent } from '@/context/ContentContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getQuestionImageSource } from '@/data/tabelaImages';
import { shuffleArray } from '@/data/mockData';
import { generateWrongExplanation } from '@/lib/groq';
import type { Question } from '@/types';

const PRACTICE_COUNT = 15;
const CATEGORY_TO_SOURCE: Record<string, string> = { kurallar: 'trafik', bakim: 'motor' };

export default function CalismaCategoryScreen() {
  /** category param: virgülle ayrılmış kategori ID'leri (ör. "trafik,ilkyardim,motor") */
  const { category } = useLocalSearchParams<{ category: string }>();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const { categories, questions: allQuestions, isContentLoading } = useContent();

  const categoryIds = (category ?? '').split(',').filter(Boolean);
  const displayName = categoryIds.length > 2
    ? `${categoryIds.length} kategori`
    : categoryIds.map((id) => categories.find((cat) => cat.id === id)?.name ?? id).join(', ');

  const [sessionKey, setSessionKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState(false);

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
    setCorrectCount(0);
    setFinished(false);
    setExplanation(null);
    setLoadingExplanation(false);
    setExplanationError(false);
  }, [sessionKey]);

  const handleSelectOption = (optionIndex: number) => {
    if (hasAnswered) return;
    setSelectedIndex(optionIndex);
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

  const handleNext = () => {
    setSelectedIndex(null);
    setExplanation(null);
    setLoadingExplanation(false);
    setExplanationError(false);
    if (isLast) {
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
            onPress={restart}
            activeOpacity={0.8}>
            <Text style={[styles.primaryBtnText, { color: c.primaryContrast }]}>Tekrar çöz</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: c.border }]}
            onPress={() => router.back()}
            activeOpacity={0.8}>
            <Text style={[styles.outlineBtnText, { color: c.text }]}>Kategorilere dön</Text>
          </TouchableOpacity>
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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>
          Soru {currentIndex + 1} / {total}
        </Text>
        <View style={styles.headerRight}>
          <MaterialIcons name="check-circle" size={18} color={c.success} />
          <Text style={[styles.headerCorrect, { color: c.success }]}>{correctCount}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBg, { backgroundColor: c.border }]}>
        <View
          style={[styles.progressFill, { backgroundColor: c.primary, width: `${((currentIndex + 1) / total) * 100}%` }]}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        {/* Soru görseli */}
        {imgSrc && (
          <View style={styles.imageWrap}>
            <Image source={imgSrc} style={styles.questionImage} resizeMode="contain" />
          </View>
        )}

        <Text style={[styles.questionText, { color: c.text }]}>{q.text}</Text>

        {/* Şıklar */}
        <View style={[styles.optionsCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.lg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderBottomWidth: 1,
  },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center', marginRight: Spacing.sm },
  headerTitle: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 44, justifyContent: 'flex-end' },
  headerCorrect: { fontSize: 15, fontWeight: '700' },

  progressBg: { height: 4, width: '100%' },
  progressFill: { height: '100%', borderRadius: 2 },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },

  imageWrap: { alignItems: 'center', marginBottom: Spacing.sm },
  questionImage: { width: 200, height: 160, borderRadius: 8 },
  questionText: { fontSize: 16, fontWeight: '600', lineHeight: 22, marginBottom: Spacing.lg },

  optionsCard: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.md, gap: 8 },
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
