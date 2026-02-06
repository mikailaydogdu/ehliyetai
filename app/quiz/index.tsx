import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius, TOUCH_TARGET_MIN } from '@/constants/theme';
import {
  shuffleArray,
  EXAM_PASS_MIN_CORRECT,
  EXAM_PASS_PERCENT,
  EXAM_DURATION_MINUTES,
} from '@/data/mockData';
import { getQuestionImageSource } from '@/data/tabelaImages';
import { useContent } from '@/context/ContentContext';
import { useStats } from '@/context/StatsContext';
import { useWrongQuestions } from '@/context/WrongQuestionsContext';
import { useLastQuizWrong } from '@/context/LastQuizWrongContext';
import { markFullExamCompleted } from '@/lib/localStorage';
import { generateWrongExplanation } from '@/lib/groq';
import type { WrongAnswer, Question } from '@/types';

export default function QuizScreen() {
  const { category, daily, fullExam } = useLocalSearchParams<{ category?: string; daily?: string; fullExam?: string }>();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { categories, getQuestionsByCategory, getMixedQuestionsForQuiz, getDailyQuizQuestions, isContentLoading } = useContent();
  const { addResult } = useStats();
  const { addWrongQuestions } = useWrongQuestions();
  const { setWrongAnswers: setLastQuizWrong } = useLastQuizWrong();

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name ?? categoryId;

  const examLabel =
    daily === '1'
      ? 'Günün Sınavı'
      : fullExam
        ? `Tam Sınav ${fullExam}`
        : category
          ? `Kategori: ${getCategoryName(category)}`
          : 'Karışık sınav';

  const [quizKey, setQuizKey] = useState(0);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByIndex, setAnswersByIndex] = useState<Record<number, number>>({});
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const loadedForKeyRef = useRef<string | null>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    if (isContentLoading) return;
    const key = `${category ?? ''}-${daily ?? ''}-${fullExam ?? ''}-${quizKey}`;
    if (loadedForKeyRef.current === key) return;
    loadedForKeyRef.current = key;
    let list: Question[] = [];
    if (daily === '1') list = getDailyQuizQuestions();
    else if (category) list = shuffleArray([...getQuestionsByCategory(category)]);
    else list = getMixedQuestionsForQuiz();
    setSessionQuestions(list);
    setCurrentIndex(0);
    setAnswersByIndex({});
    setExplanation(null);
    setLoadingExplanation(false);
    setExplanationError(false);
  }, [category, daily, fullExam, quizKey, isContentLoading]);

  const questions = sessionQuestions;
  currentIndexRef.current = currentIndex;
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalWrongAnswers, setFinalWrongAnswers] = useState<WrongAnswer[]>([]);
  const initialSeconds = (daily === '1' ? 10 : category ? 10 : EXAM_DURATION_MINUTES) * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersByIndexRef = useRef<Record<number, number>>({});
  const questionsRef = useRef<Question[]>([]);
  const lastMinuteWarnedRef = useRef(false);

  const total = questions.length;
  const q = questions[currentIndex];
  const selectedIndex = answersByIndex[currentIndex] ?? null;
  const hasAnswered = selectedIndex !== null;
  const correct = q && selectedIndex === q.correctIndex;
  const canGoBack = currentIndex > 0;
  const canGoNext = hasAnswered;
  const isFullExam = (!category && daily !== '1') || !!fullExam;
  const showResult = (!isFullExam && hasAnswered) || (daily === '1' && hasAnswered);
  const correctCountSoFar = questions.filter((qu, i) => answersByIndex[i] === qu.correctIndex).length;

  const timerMinutes = Math.floor(remainingSeconds / 60);
  const timerSeconds = remainingSeconds % 60;
  const timerLabel = `${timerMinutes.toString().padStart(2, '0')}:${timerSeconds.toString().padStart(2, '0')}`;

  answersByIndexRef.current = answersByIndex;
  questionsRef.current = sessionQuestions;

  const handleSelectOption = (optionIndex: number) => {
    if (!isFullExam && selectedIndex !== null) return;
    const idx = currentIndexRef.current;
    setAnswersByIndex((prev) => ({ ...prev, [idx]: optionIndex }));
    const question = questionsRef.current[idx];
    if (!question || optionIndex === question.correctIndex || fullExam || daily === '1') return;
    setLoadingExplanation(true);
    setExplanationError(false);
    setExplanation(null);
    generateWrongExplanation(
      question.text,
      question.options,
      optionIndex,
      question.correctIndex
    )
      .then((text) => {
        setExplanation(text);
        setExplanationError(false);
      })
      .catch(() => {
        setExplanation(null);
        setExplanationError(true);
      })
      .finally(() => setLoadingExplanation(false));
  };

  const buildWrongAnswersFromAnswers = (ans: Record<number, number>, qs: typeof questions): WrongAnswer[] => {
    const wrong: WrongAnswer[] = [];
    qs.forEach((question, i) => {
      const sel = ans[i];
      if (sel === undefined || sel === question.correctIndex) return;
      wrong.push({
        questionId: question.id,
        questionText: question.text,
        categoryId: question.categoryId,
        categoryName: getCategoryName(question.categoryId),
        selectedIndex: sel,
        correctIndex: question.correctIndex,
        options: question.options,
        imageCode: question.imageCode,
        optionImages: question.optionImages,
      });
    });
    return wrong;
  };

  /** Süre bitince sınavı bitir (timer callback’te güncel state için ref kullanır). */
  const finishWhenTimeUp = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    const ans = answersByIndexRef.current;
    const qs = questionsRef.current;
    const correctCountVal = qs.filter((qu, i) => ans[i] === qu.correctIndex).length;
    const finalWrong = buildWrongAnswersFromAnswers(ans, qs);
    setFinalScore(correctCountVal);
    setFinalWrongAnswers(finalWrong);
    addResult(correctCountVal, qs.length, finalWrong, examLabel);
    addWrongQuestions(finalWrong);
    if (fullExam) {
      const num = parseInt(fullExam, 10);
      if (num >= 1 && num <= 20) markFullExamCompleted(num);
    }
    setFinished(true);
  };

  useEffect(() => {
    setRemainingSeconds(initialSeconds);
    lastMinuteWarnedRef.current = false;
  }, [quizKey, initialSeconds]);

  useEffect(() => {
    if (finished || total === 0) return;
    timerRef.current = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 60 && !lastMinuteWarnedRef.current) {
          lastMinuteWarnedRef.current = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert('Son 1 dakika!', 'Süreniz dolmadan cevaplarınızı kontrol edin.');
        }
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          finishWhenTimeUp();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [finished, total]);

  useEffect(() => {
    const onBack = () => {
      if (showExitModal) {
        setShowExitModal(false);
        return true;
      }
      if (!finished && total > 0) {
        setShowExitModal(true);
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [finished, total, showExitModal]);

  const handleNext = () => {
    if (!canGoNext) return;
    const isLast = currentIndex >= total - 1;
    if (isLast && q) {
      const correctCountVal = questions.filter((qu, i) => answersByIndex[i] === qu.correctIndex).length;
      const finalWrong = buildWrongAnswersFromAnswers(answersByIndex, questions);
      setFinalScore(correctCountVal);
      setFinalWrongAnswers(finalWrong);
      addResult(correctCountVal, total, finalWrong, examLabel);
      addWrongQuestions(finalWrong);
      if (fullExam) {
        const num = parseInt(fullExam, 10);
        if (num >= 1 && num <= 20) markFullExamCompleted(num);
      }
      setFinished(true);
      return;
    }
    setExplanation(null);
    setLoadingExplanation(false);
    setExplanationError(false);
    setCurrentIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (!canGoBack) return;
    setExplanation(null);
    setLoadingExplanation(false);
    setExplanationError(false);
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const retryExplanation = () => {
    if (!q || selectedIndex === null || fullExam || daily === '1') return;
    setLoadingExplanation(true);
    setExplanationError(false);
    generateWrongExplanation(q.text, q.options, selectedIndex, q.correctIndex)
      .then((text) => {
        setExplanation(text);
        setExplanationError(false);
      })
      .catch(() => setExplanationError(true))
      .finally(() => setLoadingExplanation(false));
  };

  if (total === 0) {
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
          <Text style={[styles.headerTitle, { color: c.text }]}>Sınav</Text>
        </View>
        <View style={styles.emptyWrap}>
          <MaterialIcons name="quiz" size={64} color={c.icon} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>Soru bulunamadı</Text>
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

  if (finished) {
    const passed = finalScore >= EXAM_PASS_MIN_CORRECT;
    const puan = total > 0 ? Math.round((finalScore / total) * 100) : 0;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <ScrollView
          style={styles.resultScroll}
          contentContainerStyle={[styles.resultScrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.resultCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
            <Text style={[styles.resultTitle, { color: c.text }]}>
              {passed ? 'Tebrikler!' : 'Neredeyse!'}
            </Text>
            <Text style={[styles.resultScore, { color: c.primary }]}>
              {finalScore} / {total} doğru
            </Text>
            <Text style={[styles.resultPuan, { color: c.primary }]}>
              {puan} puan
            </Text>
            <Text style={[styles.resultSub, { color: c.textSecondary }]}>
              {passed
                ? 'Geçme notuna ulaştınız.'
                : `Geçmek için en az ${EXAM_PASS_MIN_CORRECT} doğru (${EXAM_PASS_PERCENT} puan) gerekir.`}
            </Text>
          </View>

          {finalWrongAnswers.length > 0 && (
            <TouchableOpacity
              style={[styles.wrongBtn, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => {
                setLastQuizWrong(finalWrongAnswers);
                router.push('/quiz/yanlis-sorular' as never);
              }}
              activeOpacity={0.8}>
              <MaterialIcons name="assignment" size={22} color={c.error} />
              <Text style={[styles.wrongBtnText, { color: c.text }]}>
                Yanlış soruları göster ({finalWrongAnswers.length})
              </Text>
              <MaterialIcons name="chevron-right" size={24} color={c.textSecondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: c.primary }]}
            onPress={() => router.replace('/(tabs)/sinav' as never)}
            activeOpacity={0.8}>
            <Text style={[styles.primaryBtnText, { color: c.primaryContrast }]}>Bitir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: c.border }]}
            onPress={() => {
              setQuizKey((k) => k + 1);
              setCurrentIndex(0);
              setAnswersByIndex({});
              setFinalWrongAnswers([]);
              setFinished(false);
            }}
            activeOpacity={0.8}>
            <Text style={[styles.outlineBtnText, { color: c.text }]}>Tekrar</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity
          onPress={() => setShowExitModal(true)}
          style={styles.backBtn}
          accessibilityLabel="Geri"
          accessibilityHint="Sınavdan çıkmak için dokunun">
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>
          Soru {currentIndex + 1} / {total}
        </Text>
        <View style={styles.headerRight}>
          <View style={styles.headerTimerWrap}>
            <MaterialIcons name="access-time" size={18} color={remainingSeconds <= 60 ? c.error : c.textSecondary} />
            <Text style={[styles.headerTimerText, { color: remainingSeconds <= 60 ? c.error : c.textSecondary }]}>
              {timerLabel}
            </Text>
          </View>
          {!isFullExam && (
            <View style={styles.headerCorrectWrap}>
              <MaterialIcons name="check-circle" size={18} color={c.success} />
              <Text style={[styles.headerCorrectText, { color: c.success }]}>{correctCountSoFar} doğru</Text>
            </View>
          )}
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
        contentContainerStyle={[
          styles.scrollContent,
          {
            flexGrow: 1,
            justifyContent: 'center',
            paddingVertical: Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Soru metni ve görsel kartın dışında */}
        {q.imageCode && getQuestionImageSource(q.imageCode) && (
          <View style={styles.signImageWrap}>
            <Image
              source={getQuestionImageSource(q.imageCode)!}
              style={styles.signImage}
              resizeMode="contain"
            />
          </View>
        )}
        <Text style={[styles.questionText, { color: c.text }]}>{q.text}</Text>

        {/* Sadece şıklar kartın içinde */}
        <View style={[styles.optionsCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
          <View style={styles.options}>
            {q.options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrect = idx === q.correctIndex;
              const optImg = q.optionImages?.[idx];
              const optImgSource = optImg ? getQuestionImageSource(optImg) : undefined;
              const bg =
                showResult && isCorrect
                  ? c.success + '20'
                  : showResult && isSelected && !correct
                    ? c.error + '20'
                    : isSelected
                      ? c.selectedBg
                      : c.card;
              const border =
                showResult && isCorrect
                  ? c.success
                  : showResult && isSelected && !correct
                    ? c.error
                    : isSelected
                      ? c.primary
                      : c.border;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    optImgSource ? styles.optionWithImage : styles.option,
                    { backgroundColor: bg, borderColor: border },
                  ]}
                  onPress={() => handleSelectOption(idx)}
                  disabled={showResult}
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
                  {showResult && isSelected && !correct && idx === selectedIndex && (
                    <MaterialIcons name="cancel" size={22} color={c.error} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {!fullExam && daily !== '1' && hasAnswered && !correct && (explanation !== null || loadingExplanation || explanationError) && (
          <View style={[styles.explanationBlock, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
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
                  style={[styles.retryExplanationBtn, { backgroundColor: c.primary, marginTop: Spacing.md }]}
                  onPress={retryExplanation}
                  activeOpacity={0.8}>
                  <Text style={[styles.retryExplanationBtnText, { color: c.primaryContrast }]}>Tekrar dene</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={[styles.explanationText, { color: c.text }]}>{explanation}</Text>
            )}
          </View>
        )}

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[
              styles.navBtn,
              { backgroundColor: canGoBack ? c.card : c.card, borderColor: c.border },
              !canGoBack && styles.navBtnDisabled,
            ]}
            onPress={handlePrev}
            disabled={!canGoBack}
            activeOpacity={0.8}>
            <MaterialIcons name="chevron-left" size={24} color={canGoBack ? c.text : c.textSecondary} />
            <Text style={[styles.navBtnText, { color: canGoBack ? c.text : c.textSecondary }]}>Geri</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navBtn,
              { backgroundColor: canGoNext ? c.primary : c.card, borderColor: canGoNext ? c.primary : c.border },
              !canGoNext && styles.navBtnDisabled,
            ]}
            onPress={handleNext}
            disabled={!canGoNext}
            activeOpacity={0.8}>
            <Text style={[styles.navBtnText, { color: canGoNext ? c.primaryContrast : c.textSecondary }]}>
              {currentIndex >= total - 1 ? 'Sonuçları Gör' : 'İleri'}
            </Text>
            <MaterialIcons name="chevron-right" size={24} color={canGoNext ? c.primaryContrast : c.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}>
        <Pressable
          style={styles.exitModalOverlay}
          onPress={() => setShowExitModal(false)}>
          <Pressable
            style={[styles.exitModalCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}
            onPress={(e) => e.stopPropagation()}>
            <View style={[styles.exitModalIconWrap, { backgroundColor: c.error + '18' }]}>
              <MaterialIcons name="exit-to-app" size={40} color={c.error} />
            </View>
            <Text style={[styles.exitModalTitle, { color: c.text }]}>
              Sınavdan çıkmak istiyor musunuz?
            </Text>
            <Text style={[styles.exitModalMessage, { color: c.textSecondary }]}>
              İlerlemeniz kaydedilmeyecek.
            </Text>
            <View style={styles.exitModalButtons}>
              <TouchableOpacity
                style={[styles.exitModalBtn, styles.exitModalBtnCancel, { borderColor: c.border }]}
                onPress={() => setShowExitModal(false)}
                activeOpacity={0.8}>
                <Text style={[styles.exitModalBtnTextCancel, { color: c.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.exitModalBtn, styles.exitModalBtnExit, { backgroundColor: c.error }]}
                onPress={() => {
                  setShowExitModal(false);
                  router.back();
                }}
                activeOpacity={0.8}>
                <Text style={[styles.exitModalBtnTextExit, { color: '#fff' }]}>Çık</Text>
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
  headerTimerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTimerText: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  headerCorrectWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerCorrectText: { fontSize: 14, fontWeight: '600' },
  progressBarBg: { height: 4, width: '100%' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.lg },
  primaryBtn: { paddingVertical: 14, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.md, alignSelf: 'stretch', alignItems: 'center' },
  primaryBtnText: { fontSize: 17, fontWeight: '700' },
  outlineBtn: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  outlineBtnText: { fontSize: 17, fontWeight: '600' },
  resultScroll: { flex: 1 },
  resultScrollContent: { padding: Spacing.lg, paddingTop: Spacing.xl, alignItems: 'center' },
  resultCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    width: '100%',
  },
  resultTitle: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.sm },
  resultScore: { fontSize: 32, fontWeight: '700', marginBottom: Spacing.sm },
  resultPuan: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.sm },
  resultSub: { fontSize: 15, textAlign: 'center' },
  wrongBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    width: '100%',
  },
  wrongBtnText: { fontSize: 16, fontWeight: '600', flex: 1, marginLeft: Spacing.sm },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xl },
  signImageWrap: { alignItems: 'center', marginBottom: Spacing.sm },
  signImage: { width: 120, height: 120 },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  optionsCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
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
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  explanationTitle: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  explanationLoading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  explanationLoadingText: { fontSize: 14 },
  explanationText: { fontSize: 14, lineHeight: 22 },
  retryExplanationBtn: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  retryExplanationBtnText: { fontSize: 15, fontWeight: '600' },
  navRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  navBtnDisabled: { opacity: 0.6 },
  navBtnText: { fontSize: 16, fontWeight: '600' },
  exitModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  exitModalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  exitModalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  exitModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  exitModalMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  exitModalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  exitModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  exitModalBtnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  exitModalBtnExit: {},
  exitModalBtnTextCancel: { fontSize: 16, fontWeight: '600' },
  exitModalBtnTextExit: { fontSize: 16, fontWeight: '600' },
});
