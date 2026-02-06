import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius, TOUCH_TARGET_MIN } from '@/constants/theme';
import { useWrongQuestions } from '@/context/WrongQuestionsContext';
import type { SavedWrongQuestion } from '@/types';
import { getQuestionImageSource } from '@/data/tabelaImages';

export default function YanlisSorularCategoryScreen() {
  const { category, categoryName } = useLocalSearchParams<{ category: string; categoryName?: string }>();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { wrongQuestions, removeWrongQuestion } = useWrongQuestions();

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
    if (optionIndex === q.correctIndex) {
      removeWrongQuestion(q.questionId);
    }
  };

  const handleNext = () => {
    setSelectedIndex(null);
    if (currentIndex >= questionsToReview.length - 1) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((i) => i + 1);
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
          Soru {currentIndex + 1} / {total}
        </Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.questionBlock, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
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

        {hasAnswered && correct && (
          <View style={[styles.feedback, { backgroundColor: c.success + '18', borderColor: c.success }, getCardShadow(c)]}>
            <MaterialIcons name="check-circle" size={24} color={c.success} />
            <Text style={[styles.feedbackText, { color: c.text }]}>Doğru!</Text>
          </View>
        )}

        {hasAnswered && (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: c.primary }]}
            onPress={handleNext}
            activeOpacity={0.8}>
            <Text style={[styles.nextBtnText, { color: c.primaryContrast }]}>Sonraki</Text>
          </TouchableOpacity>
        )}
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
  headerTitle: { fontSize: 17, fontWeight: '600', flex: 1 },
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
  signImageWrap: { alignItems: 'center', marginBottom: Spacing.sm },
  signImage: { width: 120, height: 120 },
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
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  feedbackText: { fontSize: 16, fontWeight: '600' },
  nextBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  nextBtnText: { fontSize: 17, fontWeight: '600' },
});
