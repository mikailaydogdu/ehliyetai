import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useContent } from '@/context/ContentContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
    generateQuestionsForCategory,
    generateWrongExplanation,
    type AIQuestion,
} from '@/lib/groq';
import { getQuestionImageSource } from '@/data/tabelaImages';
import { getIsaretQuestions } from '@/data/isaretSorulari';

type CalismaQuestion = AIQuestion & { imageCode?: string };

export default function CalismaCategoryScreen() {
  const { category, categoryName } = useLocalSearchParams<{
    category: string;
    categoryName?: string;
  }>();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  const { categories } = useContent();
  const displayName =
    categoryName ??
    categories.find((cat) => cat.id === category)?.name ??
    category;

  const [questions, setQuestions] = useState<CalismaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const LOADING_MESSAGES = [
    'EhliyetAI soruları hazırlıyor…',
    'Sorular oluşturuluyor…',
    'Biraz daha bekleyin…',
    'Neredeyse hazır…',
  ];

  useEffect(() => {
    if (!loading) return;
    setLoadingMessageIndex(0);
    const interval = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (category === 'isaretler') {
        const localList = getIsaretQuestions(10);
        const list: CalismaQuestion[] = localList.map((q) => ({
          soru: q.text,
          siklar: q.options,
          dogruIndex: q.correctIndex,
          imageCode: q.imageCode,
        }));
        setQuestions(list);
      } else {
        const list = await generateQuestionsForCategory(displayName);
        setQuestions(list);
      }
      setCurrentIndex(0);
      setSelectedIndex(null);
      setExplanation(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Soru yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [displayName, category]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const q = questions[currentIndex];
  const total = questions.length;
  const isLast = currentIndex === total - 1;

  const handleSelectOption = async (optionIndex: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(optionIndex);
    const correct = q.dogruIndex === optionIndex;
    if (correct) return;
    setLoadingExplanation(true);
    try {
      const text = await generateWrongExplanation(
        q.soru,
        q.siklar,
        optionIndex,
        q.dogruIndex
      );
      setExplanation(text);
      setExplanationError(false);
    } catch (e) {
      setExplanation(null);
      setExplanationError(true);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const retryExplanation = useCallback(async () => {
    if (!q || selectedIndex === null) return;
    setLoadingExplanation(true);
    setExplanationError(false);
    try {
      const text = await generateWrongExplanation(
        q.soru,
        q.siklar,
        selectedIndex,
        q.dogruIndex
      );
      setExplanation(text);
    } catch (e) {
      setExplanationError(true);
    } finally {
      setLoadingExplanation(false);
    }
  }, [q, selectedIndex]);

  const handleNext = () => {
    setSelectedIndex(null);
    setExplanation(null);
    setExplanationError(false);
    if (isLast) {
      Alert.alert(
        'Tamamlandı',
        `${total} soruyu tamamladın. Başka kategoriye çalışmak ister misin?`,
        [
          { text: 'Kategorilere dön', onPress: () => router.back() },
          { text: 'Tekrarla', onPress: () => loadQuestions() },
        ]
      );
      return;
    }
    setCurrentIndex((i) => i + 1);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={[styles.loadingText, { color: c.textSecondary }]}>
            {LOADING_MESSAGES[loadingMessageIndex]}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
        <View style={styles.centered}>
          <MaterialIcons name="error-outline" size={48} color={c.error} />
          <Text style={[styles.errorTitle, { color: c.text }]}>Bir hata oluştu</Text>
          <Text style={[styles.errorText, { color: c.textSecondary }]}>
            Sorular yüklenirken bir sorun yaşandı. Lütfen tekrar deneyin.
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: c.primary }]}
            onPress={loadQuestions}
            activeOpacity={0.8}>
            <Text style={[styles.retryBtnText, { color: c.primaryContrast }]}>Tekrar dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const correct = selectedIndex !== null && selectedIndex === q.dogruIndex;
  const showExplanation = selectedIndex !== null && !correct && (explanation !== null || loadingExplanation);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.questionBlock, { backgroundColor: c.card, borderColor: c.border }]}>
          {q.imageCode && getQuestionImageSource(q.imageCode) && (
            <View style={styles.signImageWrap}>
              <Image
                source={getQuestionImageSource(q.imageCode)!}
                style={styles.signImage}
                resizeMode="contain"
              />
            </View>
          )}
          <Text style={[styles.questionText, { color: c.text }]}>{q.soru}</Text>
          <View style={styles.options}>
            {q.siklar.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrect = idx === q.dogruIndex;
              const showCorrect = selectedIndex !== null;
              const bg =
                showCorrect && isCorrect
                  ? c.success + '20'
                  : isSelected && !correct
                    ? c.error + '20'
                    : c.card;
              const border =
                showCorrect && isCorrect
                  ? c.success
                  : isSelected && !correct
                    ? c.error
                    : c.border;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                  onPress={() => handleSelectOption(idx)}
                  disabled={selectedIndex !== null}
                  activeOpacity={0.7}>
                  <Text style={[styles.optionText, { color: c.text }]}>
                    {['A', 'B', 'C', 'D'][idx]}) {opt}
                  </Text>
                  {showCorrect && isCorrect && (
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

        {selectedIndex !== null && correct && (
          <View style={[styles.feedback, { backgroundColor: c.success + '18', borderColor: c.success }]}>
            <MaterialIcons name="check-circle" size={24} color={c.success} />
            <Text style={[styles.feedbackText, { color: c.text }]}>Doğru!</Text>
          </View>
        )}

        {showExplanation && (
          <View style={[styles.explanationBlock, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.explanationTitle, { color: c.primary }]}>Açıklama</Text>
            {loadingExplanation ? (
              <View style={styles.explanationLoading}>
                <ActivityIndicator size="small" color={c.primary} />
                <Text style={[styles.explanationLoadingText, { color: c.textSecondary }]}>
                  EhliyetAI düşünüyor…
                </Text>
              </View>
            ) : explanationError ? (
              <>
                <Text style={[styles.explanationText, { color: c.textSecondary }]}>
                  Açıklama yüklenirken bir sorun yaşandı. Tekrar denemek ister misin?
                </Text>
                <TouchableOpacity
                  style={[styles.retryBtn, { backgroundColor: c.primary, marginTop: Spacing.md }]}
                  onPress={retryExplanation}
                  activeOpacity={0.8}>
                  <Text style={[styles.retryBtnText, { color: c.primaryContrast }]}>Tekrar dene</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={[styles.explanationText, { color: c.text }]}>{explanation}</Text>
            )}
          </View>
        )}

        {(selectedIndex !== null) &&
          (correct || (!loadingExplanation && (explanation !== null || explanationError))) && (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: c.primary }]}
            onPress={handleNext}
            activeOpacity={0.8}>
            <Text style={[styles.nextBtnText, { color: c.primaryContrast }]}>
              {isLast ? 'Bitir' : 'Sonraki soru'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { marginTop: Spacing.md },
  errorTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  errorText: { marginTop: Spacing.sm, textAlign: 'center', paddingHorizontal: Spacing.lg },
  retryBtn: { marginTop: Spacing.lg, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  retryBtnText: { fontSize: 16, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  signImageWrap: { alignItems: 'center', marginBottom: Spacing.md },
  signImage: { width: 120, height: 120 },
  questionBlock: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
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
  explanationBlock: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  explanationTitle: { fontSize: 14, fontWeight: '700', marginBottom: Spacing.sm },
  explanationLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: Spacing.sm },
  explanationLoadingText: { fontSize: 14 },
  explanationText: { fontSize: 14, lineHeight: 20 },
  nextBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtnText: { fontSize: 17, fontWeight: '600' },
});
