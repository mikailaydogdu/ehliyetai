import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { addQuizResultLocal, getQuizResults, getTotalQuestionsCompleted } from '@/lib/localStorage';
import type { QuizResult, WrongAnswer } from '@/types';

interface StatsContextType {
  results: QuizResult[];
  totalQuestionsCompleted: number;
  addResult: (
    score: number,
    totalQuestions: number,
    wrongAnswers: WrongAnswer[],
    examLabel?: string
  ) => Promise<void>;
  reloadFromStorage: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | null>(null);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [totalQuestionsCompleted, setTotalQuestionsCompleted] = useState(0);

  useEffect(() => {
    getQuizResults().then(setResults);
    getTotalQuestionsCompleted().then(setTotalQuestionsCompleted);
  }, []);

  const addResult = useCallback(
    async (
      score: number,
      totalQuestions: number,
      wrongAnswers: WrongAnswer[],
      examLabel?: string
    ) => {
      await addQuizResultLocal({ score, totalQuestions, wrongAnswers, examLabel });
      const [list, total] = await Promise.all([getQuizResults(), getTotalQuestionsCompleted()]);
      setResults(list);
      setTotalQuestionsCompleted(total);
    },
    []
  );

  const reloadFromStorage = useCallback(async () => {
    const [list, total] = await Promise.all([getQuizResults(), getTotalQuestionsCompleted()]);
    setResults(list);
    setTotalQuestionsCompleted(total);
  }, []);

  const value: StatsContextType = { results, totalQuestionsCompleted, addResult, reloadFromStorage };

  return (
    <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
  );
}

export function useStats() {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error('useStats must be used within StatsProvider');
  return ctx;
}
