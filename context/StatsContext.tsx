import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { addQuizResultLocal, getQuizResults } from '@/lib/localStorage';
import type { QuizResult, WrongAnswer } from '@/types';

interface StatsContextType {
  results: QuizResult[];
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

  useEffect(() => {
    getQuizResults().then(setResults);
  }, []);

  const addResult = useCallback(
    async (
      score: number,
      totalQuestions: number,
      wrongAnswers: WrongAnswer[],
      examLabel?: string
    ) => {
      await addQuizResultLocal({ score, totalQuestions, wrongAnswers, examLabel });
      const list = await getQuizResults();
      setResults(list);
    },
    []
  );

  const reloadFromStorage = useCallback(async () => {
    const list = await getQuizResults();
    setResults(list);
  }, []);

  const value: StatsContextType = { results, addResult, reloadFromStorage };

  return (
    <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
  );
}

export function useStats() {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error('useStats must be used within StatsProvider');
  return ctx;
}
