import React, { createContext, useContext, useState, useCallback } from 'react';
import { QuizResult, WrongAnswer } from '@/types';

interface StatsContextType {
  results: QuizResult[];
  addResult: (score: number, total: number, wrong: WrongAnswer[]) => void;
}

const StatsContext = createContext<StatsContextType | null>(null);

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [results, setResults] = useState<QuizResult[]>([]);

  const addResult = useCallback(
    (score: number, total: number, wrong: WrongAnswer[]) => {
      setResults((prev) => [
        {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          score,
          totalQuestions: total,
          wrongAnswers: wrong,
        },
        ...prev,
      ]);
    },
    []
  );

  return (
    <StatsContext.Provider value={{ results, addResult }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error('useStats must be used within StatsProvider');
  return ctx;
}
