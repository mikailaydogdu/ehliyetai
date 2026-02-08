import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { BorderRadius, Colors, getCardShadow, Spacing, TOUCH_TARGET_MIN } from '@/constants/theme';
import { getQuestionImageSource } from '@/data/tabelaImages';
import { useWrongQuestions } from '@/context/WrongQuestionsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { SavedWrongQuestion } from '@/types';

const PAGE_SIZE = 10;

export default function NotlarCategoryScreen() {
  const { category, categoryName } = useLocalSearchParams<{ category: string; categoryName?: string }>();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { wrongQuestions } = useWrongQuestions();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const notesInCategory = useMemo(
    () =>
      wrongQuestions.filter(
        (q): q is SavedWrongQuestion & { aiNote: string } =>
          q.categoryId === category && Boolean(q.aiNote)
      ),
    [wrongQuestions, category]
  );

  const title = categoryName ?? category;

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
        <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        {notesInCategory.length === 0 ? (
          <View style={[styles.emptyWrap, { backgroundColor: c.card, borderColor: c.border }]}>
            <MaterialIcons name="notes" size={48} color={c.icon} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>Bu kategoride not yok</Text>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: c.primary }]}
              onPress={() => router.back()}
              activeOpacity={0.8}>
              <Text style={[styles.backButtonText, { color: c.primaryContrast }]}>Geri dön</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {notesInCategory.slice(0, visibleCount).map((q) => {
              const questionImgSrc = q.imageCode ? getQuestionImageSource(q.imageCode) : undefined;
              const correctOptionCode = q.optionImages?.[q.correctIndex];
              const correctOptionImgSrc = correctOptionCode ? getQuestionImageSource(correctOptionCode) : undefined;
              return (
                <View
                  key={q.questionId}
                  style={[styles.noteCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
                  {questionImgSrc && (
                    <View style={styles.questionImageWrap}>
                      <Image source={questionImgSrc} style={styles.questionImage} resizeMode="contain" />
                    </View>
                  )}
                  {correctOptionImgSrc && (
                    <View style={styles.imageWrap}>
                      <Text style={[styles.correctLabel, { color: c.textSecondary }]}>
                        Doğru cevap ({['A', 'B', 'C', 'D'][q.correctIndex]})
                      </Text>
                      <Image source={correctOptionImgSrc} style={styles.noteImage} resizeMode="contain" />
                    </View>
                  )}
                  <Text style={[styles.noteText, { color: c.text }]}>{q.aiNote}</Text>
                </View>
              );
            })}
            {notesInCategory.length > visibleCount && (
              <TouchableOpacity
                style={[styles.loadMoreBtn, { borderColor: c.border }]}
                onPress={() => setVisibleCount((n) => n + PAGE_SIZE)}
                activeOpacity={0.7}>
                <Text style={[styles.loadMoreText, { color: c.primary }]}>Daha fazla</Text>
                <MaterialIcons name="expand-more" size={24} color={c.primary} />
              </TouchableOpacity>
            )}
          </>
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
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  emptyWrap: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: Spacing.md, textAlign: 'center' },
  backButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  noteCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  questionImageWrap: { width: '100%', alignItems: 'center', marginBottom: Spacing.md },
  questionImage: { width: '100%', height: 220, borderRadius: BorderRadius.sm },
  imageWrap: { alignItems: 'center', marginBottom: Spacing.md },
  correctLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  noteImage: { width: 200, height: 160, borderRadius: BorderRadius.sm },
  noteText: { fontSize: 14, lineHeight: 20 },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  loadMoreText: { fontSize: 16, fontWeight: '600' },
});
