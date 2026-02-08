import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { getQuestionImageSource } from '@/data/tabelaImages';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useWrongQuestions } from '@/context/WrongQuestionsContext';
import { generateWrongExplanation } from '@/lib/groq';
import type { SavedWrongQuestion } from '@/types';

export default function HeroScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { wrongQuestions, removeWrongQuestion } = useWrongQuestions();

  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationError, setExplanationError] = useState(false);

  const list = wrongQuestions;
  const current = list[currentIndex];
  const total = list.length;

  const loadExplanation = useCallback((item: SavedWrongQuestion) => {
    if (item.aiNote) {
      setExplanation(item.aiNote);
      setExplanationLoading(false);
      setExplanationError(false);
      return;
    }
    setExplanationLoading(true);
    setExplanationError(false);
    setExplanation(null);
    generateWrongExplanation(
      item.questionText,
      item.options,
      item.selectedIndex,
      item.correctIndex
    )
      .then((text) => {
        setExplanation(text);
        setExplanationError(false);
      })
      .catch(() => {
        setExplanation(null);
        setExplanationError(true);
      })
      .finally(() => setExplanationLoading(false));
  }, []);

  useEffect(() => {
    if (current) loadExplanation(current);
  }, [current?.questionId, loadExplanation]);

  useEffect(() => {
    if (list.length > 0 && currentIndex >= list.length) setCurrentIndex(0);
  }, [list.length, currentIndex]);

  const onUnderstood = useCallback(() => {
    if (!current) return;
    removeWrongQuestion(current.questionId);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    if (list.length <= 1) {
      setCurrentIndex(0);
      setExplanation(null);
    } else {
      setCurrentIndex((i) => (i >= list.length - 1 ? 0 : i + 1));
    }
  }, [current, list.length, removeWrongQuestion]);

  const onShowAgain = useCallback(() => {
    if (list.length === 0) return;
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setCurrentIndex((i) => (i >= list.length - 1 ? 0 : i + 1));
  }, [list.length]);

  if (list.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
        <View style={[styles.emptyWrap, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: c.card, borderColor: c.border },
              getCardShadow(c),
            ]}>
            <MaterialIcons name="check-circle" size={64} color={c.success} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>Henüz yanlış soru yok</Text>
            <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>
              Sınav veya konu testi çöz; yanlış yaptığın sorular burada kartlar halinde görünür.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!current) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.counterRow, { borderBottomColor: c.border }]}>
          <Text style={[styles.counterText, { color: c.textSecondary }]}>
            {currentIndex + 1} / {total}
          </Text>
        </View>

        <View
          style={[
            styles.questionBlock,
            { backgroundColor: c.card, borderColor: c.border },
            getCardShadow(c),
          ]}>
          {current.imageCode && getQuestionImageSource(current.imageCode) && (
            <View style={styles.signImageWrap}>
              <Image
                source={getQuestionImageSource(current.imageCode)!}
                style={styles.signImage}
                resizeMode="contain"
              />
            </View>
          )}
          <Text style={[styles.questionText, { color: c.text }]}>{current.questionText}</Text>
          <View style={styles.options}>
            {current.options.map((opt, idx) => {
              const isUserWrong = idx === current.selectedIndex;
              const isCorrect = idx === current.correctIndex;
              const bg = isCorrect ? c.success + '20' : isUserWrong ? c.error + '20' : c.card;
              const border = isCorrect ? c.success : isUserWrong ? c.error : c.border;
              const optImg = current.optionImages?.[idx];
              const optImgSource = optImg ? getQuestionImageSource(optImg) : undefined;
              return (
                <View
                  key={idx}
                  style={[
                    optImgSource ? styles.optionWithImage : styles.option,
                    { backgroundColor: bg, borderColor: border },
                  ]}>
                  {optImgSource ? (
                    <View style={styles.optionImageRow}>
                      <Text style={[styles.optionLabel, { color: c.text }]}>
                        {['A', 'B', 'C', 'D'][idx]})
                      </Text>
                      <Image
                        source={optImgSource}
                        style={styles.optionImage}
                        resizeMode="contain"
                      />
                    </View>
                  ) : (
                    <Text style={[styles.optionText, { color: c.text }]}>
                      {['A', 'B', 'C', 'D'][idx]}) {opt}
                    </Text>
                  )}
                  {isCorrect && <MaterialIcons name="check-circle" size={22} color={c.success} />}
                  {isUserWrong && <MaterialIcons name="cancel" size={22} color={c.error} />}
                </View>
              );
            })}
          </View>
        </View>

        <View
          style={[
            styles.explanationBlock,
            { backgroundColor: c.card, borderColor: c.border },
            getCardShadow(c),
          ]}>
          <Text style={[styles.explanationTitle, { color: c.text }]}>Açıklama</Text>
          {explanationLoading && (
            <View style={styles.explanationLoadingRow}>
              <ActivityIndicator size="small" color={c.primary} />
              <Text style={[styles.explanationLoadingText, { color: c.textSecondary }]}>
                Yükleniyor…
              </Text>
            </View>
          )}
          {explanationError && !explanationLoading && (
            <Text style={[styles.explanationErrorText, { color: c.textSecondary }]}>
              Açıklama yüklenemedi.
            </Text>
          )}
          {explanation && !explanationLoading && (
            <Text style={[styles.explanationText, { color: c.text }]}>{explanation}</Text>
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.replayBtn, { borderColor: c.border }]}
            onPress={onShowAgain}
            activeOpacity={0.8}>
            <MaterialIcons name="replay" size={22} color={c.primary} />
            <Text style={[styles.actionBtnText, { color: c.primary }]}>Tekrar göster</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.understoodBtn, { backgroundColor: c.primary }]}
            onPress={onUnderstood}
            activeOpacity={0.8}>
            <MaterialIcons name="check-circle" size={22} color={c.primaryContrast} />
            <Text style={[styles.actionBtnTextPrimary, { color: c.primaryContrast }]}>Anladım</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    maxWidth: 360,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
  counterRow: {
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  counterText: { fontSize: 14, fontWeight: '600' },
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
  explanationBlock: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  explanationTitle: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  explanationLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  explanationLoadingText: { fontSize: 15 },
  explanationErrorText: { fontSize: 15 },
  explanationText: { fontSize: 15, lineHeight: 24 },
  actionRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  replayBtn: { borderWidth: 2 },
  understoodBtn: {},
  actionBtnText: { fontSize: 17, fontWeight: '600' },
  actionBtnTextPrimary: { fontSize: 17, fontWeight: '600' },
});
