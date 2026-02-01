import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Alert,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius } from '@/constants/theme';
import {
  getQuestionsByCategory,
  getMixedQuestionsForQuiz,
  mockCategories,
  EXAM_DURATION_MINUTES,
  EXAM_PASS_MIN_CORRECT,
} from '@/data/mockData';
import { useStats } from '@/context/StatsContext';
import { useWrongQuestions } from '@/context/WrongQuestionsContext';
import type { WrongAnswer } from '@/types';
import { getTabelaImage } from '@/data/tabelaImages';
import type { ThemeColors } from '@/constants/theme';
import type { Question } from '@/types';

const LOADING_DELAY_MS = 200;

/** Tek soru bloğu – sadece kendi cevabı değişince yeniden render (performans) */
const QuestionBlock = React.memo(function QuestionBlock({
  q,
  qIndex,
  total,
  selectedIndex,
  onSelect,
  c,
}: {
  q: Question;
  qIndex: number;
  total: number;
  selectedIndex: number | undefined;
  onSelect: (questionIndex: number, optionIndex: number) => void;
  c: ThemeColors;
}) {
  const img = q.imageCode ? getTabelaImage(q.imageCode) : null;
  return (
    <View
      style={[styles.questionBlock, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
      <Text style={[styles.questionNumber, { color: c.textSecondary }]}>
        Soru {qIndex + 1} / {total}
      </Text>
      {img != null && (
        <View style={styles.signImageWrap}>
          <Image source={img} style={styles.signImage} resizeMode="contain" />
        </View>
      )}
      <Text style={[styles.questionText, { color: c.text }]}>{q.text}</Text>
      <View style={styles.options}>
        {q.options.map((option, optionIndex) => {
          const isSelected = selectedIndex === optionIndex;
          const optionBg = isSelected ? c.selectedBg : c.card;
          const optionBorder = isSelected ? c.primary : c.border;
          return (
            <TouchableOpacity
              key={optionIndex}
              style={[styles.option, { backgroundColor: optionBg, borderColor: optionBorder }]}
              onPress={() => onSelect(qIndex, optionIndex)}
              activeOpacity={0.7}>
              <Text style={[styles.optionText, { color: c.text }]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

export default function QuizScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [retryKey, setRetryKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { addResult } = useStats();
  const { addWrongQuestions } = useWrongQuestions();

  const questions = useMemo(() => {
    if (category) return getQuestionsByCategory(category);
    return getMixedQuestionsForQuiz();
  }, [category, retryKey]);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [wrongList, setWrongList] = useState<WrongAnswer[]>([]);

  const total = questions.length;
  const categoryInfo = category ? mockCategories.find((cat) => cat.id === category) : null;
  const correctCount = score ?? 0;
  const wrongCount = wrongList.length;

  /** Kategori sınavı 15 dk, tam sınav 45 dk */
  const quizMinutes = category ? 15 : EXAM_DURATION_MINUTES;
  const [remainingSeconds, setRemainingSeconds] = useState(quizMinutes * 60);

  useEffect(() => {
    if (questions.length === 0) {
      setIsLoading(false);
      return;
    }
    const t = setTimeout(() => setIsLoading(false), LOADING_DELAY_MS);
    return () => clearTimeout(t);
  }, [questions.length]);

  useEffect(() => {
    if (isLoading || finished || questions.length === 0) return;
    const id = setInterval(() => {
      setRemainingSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isLoading, finished, questions.length]);

  useEffect(() => {
    if (remainingSeconds === 0 && !finished && questions.length > 0) {
      finishQuiz();
    }
  }, [remainingSeconds, finished, questions.length]);

  const timerLabel =
    remainingSeconds >= 0
      ? `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')}`
      : '0:00';

  const askExit = () => {
    Alert.alert(
      'Emin misiniz?',
      'Çıkmak istediğinize emin misiniz? Sınav yarıda kalacak.',
      [
        { text: 'Hayır', style: 'cancel' },
        { text: 'Evet, Çık', onPress: () => router.back() },
      ]
    );
  };

  /** Telefon geri tuşu: sınav devam ederken çıkışta "Emin misiniz?" göster */
  useEffect(() => {
    if (finished || questions.length === 0) return;
    const onBack = () => {
      askExit();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [finished, questions.length]);

  const handleSelect = useCallback((questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }, []);

  function finishQuiz() {
    let correct = 0;
    const wrong: WrongAnswer[] = [];
    questions.forEach((q, i) => {
      const userAnswer = answers[i];
      if (userAnswer === q.correctIndex) {
        correct++;
      } else if (userAnswer !== undefined) {
        wrong.push({
          questionId: q.id,
          questionText: q.text,
          categoryId: q.categoryId,
          categoryName: mockCategories.find((cat) => cat.id === q.categoryId)?.name ?? '',
          selectedIndex: userAnswer,
          correctIndex: q.correctIndex,
          options: q.options,
          imageCode: q.imageCode,
        });
      }
    });
    setScore(correct);
    setWrongList(wrong);
    addResult(correct, total, wrong);
    addWrongQuestions(wrong);
    setFinished(true);
  }

  const handleTekrar = () => {
    setFinished(false);
    setScore(null);
    setWrongList([]);
    setAnswers({});
    setRemainingSeconds(quizMinutes * 60);
    setRetryKey((k) => k + 1);
  };

  if (questions.length === 0) {
    const emptyMessage = category
      ? 'Bu kategoride henüz soru yok.'
      : 'Henüz soru yok.';
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>
            {categoryInfo?.name ?? 'Sınav'}
          </Text>
        </View>
        <Text style={{ color: c.text, textAlign: 'center', padding: 24 }}>
          {emptyMessage}
        </Text>
      </SafeAreaView>
    );
  }

  // Sonuç ekranı: doğru/yanlış, puan, Tekrar ve Bitir
  if (finished && score !== null) {
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>Sonuç</Text>
          <View style={styles.headerRight} />
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.resultContent, { paddingBottom: insets.bottom + Spacing.lg }]}
          showsVerticalScrollIndicator={false}>
          {!category && (
            <View style={[styles.passBadge, { backgroundColor: (score >= EXAM_PASS_MIN_CORRECT) ? c.success : c.error }]}>
              <MaterialIcons name={(score >= EXAM_PASS_MIN_CORRECT) ? 'check-circle' : 'cancel'} size={24} color={c.primaryContrast} />
              <Text style={[styles.passBadgeText, { color: c.primaryContrast }]}>
                {(score >= EXAM_PASS_MIN_CORRECT) ? 'Geçtiniz' : 'Kaldınız'}
              </Text>
            </View>
          )}
          <View style={[styles.scoreCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
            <Text style={[styles.scoreTitle, { color: c.text }]}>Puan</Text>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreValue, { color: c.primary }]}>{score}/{total}</Text>
              <Text style={[styles.scorePercent, { color: c.textSecondary }]}>%{percent}</Text>
            </View>
            {!category && (
              <Text style={[styles.passHint, { color: c.textSecondary }]}>
                Geçmek için en az {EXAM_PASS_MIN_CORRECT} doğru gerekir.
              </Text>
            )}
            <View style={styles.statsRow}>
              <View style={[styles.statBadge, { backgroundColor: c.success }]}>
                <MaterialIcons name="check" size={20} color={c.primaryContrast} />
                <Text style={[styles.statText, { color: c.primaryContrast }]}>Doğru: {correctCount}</Text>
              </View>
              <View style={[styles.statBadge, { backgroundColor: c.error }]}>
                <MaterialIcons name="close" size={20} color={c.primaryContrast} />
                <Text style={[styles.statText, { color: c.primaryContrast }]}>Yanlış: {wrongCount}</Text>
              </View>
            </View>
          </View>

          <View style={styles.resultButtons}>
            <TouchableOpacity
              style={[styles.resultBtn, { backgroundColor: c.primary }]}
              onPress={handleTekrar}
              activeOpacity={0.8}>
              <Text style={[styles.resultBtnText, { color: c.primaryContrast }]}>Tekrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resultBtn, styles.resultBtnOutline, { borderColor: c.primary }]}
              onPress={() => router.back()}
              activeOpacity={0.8}>
              <Text style={[styles.resultBtnTextOutline, { color: c.primary }]}>Bitir</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Veriler yüklenene kadar sadece dönme (spinner)
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={askExit} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>Sınav</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Sınav ekranı: açıklama (kategori varsa) + sorular alt alta + Bitir
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={askExit} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
          {categoryInfo?.name ?? 'Karışık Sınav'}
        </Text>
        <View style={[styles.timerWrap, { backgroundColor: c.selectedBg }]}>
          <MaterialIcons name="timer" size={18} color={c.text} />
          <Text style={[styles.timerText, { color: c.text }]}>{timerLabel}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, Spacing.md) + 80 },
        ]}
        showsVerticalScrollIndicator={false}>
        {categoryInfo?.description && (
          <View style={[styles.explanationBox, { backgroundColor: c.primary }]}>
            <Text style={[styles.explanationText, { color: c.primaryContrast }]}>{categoryInfo.description}</Text>
          </View>
        )}

        {!categoryInfo?.description && !category && (
          <View style={[styles.explanationBox, { backgroundColor: c.primary }]}>
            <Text style={[styles.explanationText, { color: c.primaryContrast }]}>
              Tüm kategorilerden karışık {total} soru. Cevaplarını seçip Bitir ile gönder.
            </Text>
          </View>
        )}

        {questions.map((q, qIndex) => (
          <QuestionBlock
            key={q.id}
            q={q}
            qIndex={qIndex}
            total={total}
            selectedIndex={answers[qIndex]}
            onSelect={handleSelect}
            c={c}
          />
        ))}

        <TouchableOpacity
          style={[styles.bitirButton, { backgroundColor: c.primary }]}
          onPress={finishQuiz}
          activeOpacity={0.8}>
          <Text style={[styles.bitirButtonText, { color: c.primaryContrast }]}>Bitir</Text>
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
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: Spacing.sm },
  headerTitle: { fontSize: 17, fontWeight: '600', flex: 1 },
  headerRight: { width: 56 },
  timerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  timerText: { fontSize: 15, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xl },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  explanationBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  questionBlock: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  questionNumber: { fontSize: 13, marginBottom: 4 },
  signImageWrap: { alignItems: 'center', marginBottom: Spacing.sm },
  signImage: { width: 120, height: 120 },
  questionText: { fontSize: 16, fontWeight: '600', lineHeight: 22, marginBottom: Spacing.sm },
  options: { gap: 8 },
  option: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionText: { fontSize: 15 },
  bitirButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  bitirButtonText: { fontSize: 17, fontWeight: '600' },
  resultContent: { padding: Spacing.md },
  passBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  passBadgeText: { fontSize: 18, fontWeight: '700' },
  passHint: { fontSize: 13, marginTop: 4 },
  scoreCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  scoreTitle: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  scoreValue: { fontSize: 32, fontWeight: '700' },
  scorePercent: { fontSize: 18 },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statText: { fontSize: 14, fontWeight: '600' },
  resultButtons: { gap: Spacing.sm },
  resultBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultBtnOutline: { backgroundColor: 'transparent', borderWidth: 2 },
  resultBtnText: { fontSize: 17, fontWeight: '600' },
  resultBtnTextOutline: { fontSize: 17, fontWeight: '600' },
});
