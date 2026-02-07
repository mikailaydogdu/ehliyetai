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
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
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
import { submitQuestionReport, type ReportReason } from '@/lib/firebase';
import type { WrongAnswer, Question } from '@/types';
import { captureRef } from 'react-native-view-shot';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'soru_yanlis', label: 'Soru yanlış' },
  { value: 'soru_hatali', label: 'Soru hatalı' },
  { value: 'cevap_yanlis', label: 'Cevap yanlış' },
  { value: 'cevap_yanlis_isaretlenmis', label: 'Cevap yanlış işaretlenmiş' },
  { value: 'diger', label: 'Diğer' },
];

export default function QuizScreen() {
  const { category, daily, fullExam } = useLocalSearchParams<{ category?: string; daily?: string; fullExam?: string }>();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { categories, getQuestionsByCategory, getMixedQuestionsForQuiz, getDailyQuizQuestions, isContentLoading } = useContent();
  const { addResult } = useStats();
  const { addWrongQuestions, updateWrongQuestionNote } = useWrongQuestions();
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
  /** Açıklama soru indeksine göre saklanır; ileri/geri gidince yerinde kalır */
  const [explanationsByIndex, setExplanationsByIndex] = useState<Record<number, { text: string | null; error: boolean }>>({});
  const [loadingExplanationIndex, setLoadingExplanationIndex] = useState<number | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showQuestionMenu, setShowQuestionMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason | null>(null);
  const loadedForKeyRef = useRef<string | null>(null);
  const currentIndexRef = useRef(0);
  const questionCardRef = useRef<View>(null);

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
    setExplanationsByIndex({});
    setLoadingExplanationIndex(null);
  }, [category, daily, fullExam, quizKey, isContentLoading]);

  const questions = sessionQuestions;
  currentIndexRef.current = currentIndex;
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalWrongAnswers, setFinalWrongAnswers] = useState<WrongAnswer[]>([]);
  /** Sonuç ekranında tüm soruları doğru/yanlış göstermek için */
  const [finalQuestions, setFinalQuestions] = useState<Question[]>([]);
  const [finalAnswersByIndex, setFinalAnswersByIndex] = useState<Record<number, number>>({});
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
  const explanationForCurrent = explanationsByIndex[currentIndex];
  const explanation = explanationForCurrent?.text ?? null;
  const explanationError = explanationForCurrent?.error ?? false;
  const loadingExplanation = loadingExplanationIndex === currentIndex;
  const needsExplanation = hasAnswered && !correct && !fullExam && daily !== '1';
  const explanationReady = explanation !== null || explanationError;
  const canGoBack = currentIndex > 0 && (!needsExplanation || explanationReady);
  const canGoNext = hasAnswered && (!needsExplanation || explanationReady);
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
    setLoadingExplanationIndex(idx);
    generateWrongExplanation(
      question.text,
      question.options,
      optionIndex,
      question.correctIndex
    )
      .then((text) => {
        setExplanationsByIndex((prev) => ({ ...prev, [idx]: { text, error: false } }));
      })
      .catch(() => {
        setExplanationsByIndex((prev) => ({ ...prev, [idx]: { text: null, error: true } }));
      })
      .finally(() => setLoadingExplanationIndex(null));
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
    setFinalQuestions(qs);
    setFinalAnswersByIndex(ans);
    setFinalScore(correctCountVal);
    setFinalWrongAnswers(finalWrong);
    addResult(correctCountVal, qs.length, finalWrong, examLabel);
    addWrongQuestions(finalWrong);
    finalWrong.forEach((q) => {
      generateWrongExplanation(q.questionText, q.options ?? [], q.selectedIndex, q.correctIndex)
        .then((note) => updateWrongQuestionNote(q.questionId, note))
        .catch(() => {});
    });
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
      setFinalQuestions(questions);
      setFinalAnswersByIndex(answersByIndex);
      setFinalScore(correctCountVal);
      setFinalWrongAnswers(finalWrong);
      addResult(correctCountVal, total, finalWrong, examLabel);
      addWrongQuestions(finalWrong);
      finalWrong.forEach((q) => {
        generateWrongExplanation(q.questionText, q.options ?? [], q.selectedIndex, q.correctIndex)
          .then((note) => updateWrongQuestionNote(q.questionId, note))
          .catch(() => {});
      });
      if (fullExam) {
        const num = parseInt(fullExam, 10);
        if (num >= 1 && num <= 20) markFullExamCompleted(num);
      }
      setFinished(true);
      return;
    }
    setLoadingExplanationIndex(null);
    setCurrentIndex((i) => i + 1);
  };

  const handlePrev = () => {
    if (!canGoBack) return;
    setLoadingExplanationIndex(null);
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const retryExplanation = () => {
    if (!q || selectedIndex === null || fullExam || daily === '1') return;
    const idx = currentIndex;
    setLoadingExplanationIndex(idx);
    generateWrongExplanation(q.text, q.options, selectedIndex, q.correctIndex)
      .then((text) => {
        setExplanationsByIndex((prev) => ({ ...prev, [idx]: { text, error: false } }));
      })
      .catch(() => {
        setExplanationsByIndex((prev) => ({ ...prev, [idx]: { text: null, error: true } }));
      })
      .finally(() => setLoadingExplanationIndex(null));
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

          {/* Tüm sorular: doğru/yanlış, doğru şık işaretli */}
          {finalQuestions.length > 0 && (
            <View style={styles.resultQuestionsWrap}>
              <Text style={[styles.resultSectionTitle, { color: c.text }]}>Tüm sorular</Text>
              {finalQuestions.map((question, i) => {
                const sel = finalAnswersByIndex[i] ?? undefined;
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
                          { backgroundColor: isCorrect ? c.success + '20', borderColor: isCorrect ? c.success : c.error },
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
            </View>
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
              setFinalQuestions([]);
              setFinalAnswersByIndex({});
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
          {currentIndex + 1} / {total}
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
        contentContainerStyle={[
          styles.scrollContent,
          {
            flexGrow: 1,
            justifyContent: 'center',
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View
          ref={questionCardRef}
          style={[
            styles.optionsCard,
            { backgroundColor: c.card, borderColor: c.border },
            getCardShadow(c),
          ]}
          collapsable={false}>
          <View style={styles.questionCardInner}>
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

        {(!needsExplanation || explanationReady) && (
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
        )}
      </ScrollView>

      {/* Soru menüsü: Paylaş, Bildir */}
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
                const shareCard = () => {
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
                    .catch(() => {
                      Share.share({ message: q?.text ?? '' });
                    });
                };
                setTimeout(shareCard, 400);
              }}
              activeOpacity={0.7}>
              <MaterialIcons name="share" size={22} color={c.text} />
              <Text style={[styles.questionMenuItemText, { color: c.text }]}>Paylaş</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.questionMenuItem}
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

      {/* Bildir: sebep seç + gönder */}
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
                  }).then(() => {
                    setShowReportModal(false);
                    setReportReason(null);
                    Alert.alert('Teşekkürler', 'Bildiriminiz alındı.');
                  }).catch(() => {
                    Alert.alert('Hata', 'Bildirim gönderilemedi. Tekrar deneyin.');
                  });
                }}
                disabled={!reportReason}
                activeOpacity={0.8}>
                <Text style={[styles.reportModalBtnTextPrimary, { color: c.primaryContrast }]}>Bildir</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
  resultQuestionsWrap: { width: '100%', marginTop: Spacing.lg, marginBottom: Spacing.md },
  resultSectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md, paddingHorizontal: Spacing.sm },
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
  scrollContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  questionCardInner: { padding: Spacing.md },
  headerMenuBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  signImageWrap: { alignItems: 'center', marginBottom: Spacing.sm },
  signImage: { width: 120, height: 120 },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  optionsCard: {
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  questionMenuItemText: { fontSize: 16, fontWeight: '500' },
  reportModalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  reportModalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  reportModalSubtitle: { fontSize: 14, marginBottom: Spacing.md },
  reportReasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  reportReasonLabel: { fontSize: 15, fontWeight: '500' },
  reportModalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    justifyContent: 'flex-end',
  },
  reportModalBtn: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  reportModalBtnPrimary: {},
  reportModalBtnText: { fontSize: 15, fontWeight: '600' },
  reportModalBtnTextPrimary: { fontSize: 15, fontWeight: '600' },
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
