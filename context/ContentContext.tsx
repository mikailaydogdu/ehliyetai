import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getIsaretQuestions } from '@/data/isaretSorulari';
import {
  mockCategories as localCategoriesTemplate,
  shuffleArray,
  CALISMA_QUESTION_COUNT,
  EXAM_ILK_YARDIM,
  EXAM_TRAFIK_ADABI,
  EXAM_TRAFIK_TEXT,
  EXAM_ISARET_IN_EXAM,
  EXAM_MOTOR,
  EXAM_TOTAL_QUESTIONS,
  QUIZ_MAX_QUESTIONS,
} from '@/data/mockData';
import { loadQuestionsFromFirebase, loadNotesFromFirebase } from '@/lib/remoteContent';
import type { Category, Question } from '@/types';

const CATEGORY_TO_SOURCE: Record<string, string> = {
  kurallar: 'trafik',
  bakim: 'motor',
};

interface ContentContextType {
  categories: Category[];
  questions: Question[];
  isContentLoading: boolean;
  contentError: string | null;
  getQuestionsByCategory: (categoryId: string) => Question[];
  getQuestionsForCalisma: (categoryIds: string[]) => Question[];
  getMixedQuestionsForQuiz: () => Question[];
  getDailyQuizQuestions: () => Question[];
}

const ContentContext = createContext<ContentContextType | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>(localCategoriesTemplate);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsContentLoading(true);
      setContentError(null);
      try {
        const [questionsData, notesByCategory] = await Promise.all([
          loadQuestionsFromFirebase(),
          loadNotesFromFirebase(),
        ]);
        if (cancelled) return;
        setQuestions(questionsData);
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            lessons: notesByCategory[cat.id] ?? (cat.id === 'isaretler' ? cat.lessons : []),
          }))
        );
      } catch (e) {
        if (!cancelled) {
          setContentError(e instanceof Error ? e.message : 'İçerik yüklenemedi');
          setQuestions([]);
        }
      } finally {
        if (!cancelled) setIsContentLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getQuestionsByCategory = useCallback(
    (categoryId: string): Question[] => {
      if (categoryId === 'isaretler') {
        return getIsaretQuestions(QUIZ_MAX_QUESTIONS);
      }
      const sourceId = CATEGORY_TO_SOURCE[categoryId] ?? categoryId;
      const pool = questions.filter((q) => q.categoryId === sourceId);
      return shuffleArray(pool).slice(0, QUIZ_MAX_QUESTIONS);
    },
    [questions]
  );

  const getQuestionsForCalisma = useCallback(
    (categoryIds: string[]): Question[] => {
      if (categoryIds.length === 0) return [];
      const sourceIds = new Set(categoryIds.map((id) => CATEGORY_TO_SOURCE[id] ?? id));
      let pool = questions.filter((q) => sourceIds.has(q.categoryId));
      if (sourceIds.has('isaretler')) {
        pool = [...pool, ...getIsaretQuestions(CALISMA_QUESTION_COUNT)];
      }
      return shuffleArray(pool).slice(0, CALISMA_QUESTION_COUNT);
    },
    [questions]
  );

  const getMixedQuestionsForQuiz = useCallback((): Question[] => {
    const byCategory: Record<string, Question[]> = {};
    questions.forEach((q) => {
      if (!byCategory[q.categoryId]) byCategory[q.categoryId] = [];
      byCategory[q.categoryId].push(q);
    });
    const ilkyardim = shuffleArray(byCategory['ilkyardim'] ?? []).slice(0, EXAM_ILK_YARDIM);
    const trafikadabi = shuffleArray(byCategory['trafikadabi'] ?? []).slice(0, EXAM_TRAFIK_ADABI);
    const trafikText = shuffleArray(byCategory['trafik'] ?? []).slice(0, EXAM_TRAFIK_TEXT);
    const trafikIsaret = getIsaretQuestions(EXAM_ISARET_IN_EXAM);
    const trafik = shuffleArray([...trafikText, ...trafikIsaret]);
    const motor = shuffleArray(byCategory['motor'] ?? []).slice(0, EXAM_MOTOR);
    const combined = [...ilkyardim, ...trafikadabi, ...trafik, ...motor];
    if (__DEV__ && combined.length !== EXAM_TOTAL_QUESTIONS) {
      console.warn(
        `[getMixedQuestionsForQuiz] Beklenen ${EXAM_TOTAL_QUESTIONS} soru, gelen ${combined.length}.`
      );
    }
    return shuffleArray(combined);
  }, [questions]);

  const getDailyQuizQuestions = useCallback((): Question[] => {
    const byCategory: Record<string, Question[]> = {};
    questions.forEach((q) => {
      if (!byCategory[q.categoryId]) byCategory[q.categoryId] = [];
      byCategory[q.categoryId].push(q);
    });
    const pick = (arr: Question[], n: number): Question[] => {
      if (arr.length <= n) return shuffleArray([...arr]);
      const shuffled = shuffleArray([...arr]);
      return shuffled.slice(0, n);
    };
    const ilkyardim = pick(byCategory['ilkyardim'] ?? [], 2);
    const trafikadabi = pick(byCategory['trafikadabi'] ?? [], 2);
    const trafikText = pick(byCategory['trafik'] ?? [], 2);
    const motor = pick(byCategory['motor'] ?? [], 2);
    const isaretler = pick(getIsaretQuestions(10), 2);
    const combined = [...ilkyardim, ...trafikadabi, ...trafikText, ...motor, ...isaretler];
    return shuffleArray(combined);
  }, [questions]);

  const value = useMemo<ContentContextType>(
    () => ({
      categories,
      questions,
      isContentLoading,
      contentError,
      getQuestionsByCategory,
      getQuestionsForCalisma,
      getMixedQuestionsForQuiz,
      getDailyQuizQuestions,
    }),
    [
      categories,
      questions,
      isContentLoading,
      contentError,
      getQuestionsByCategory,
      getQuestionsForCalisma,
      getMixedQuestionsForQuiz,
      getDailyQuizQuestions,
    ]
  );

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
}
