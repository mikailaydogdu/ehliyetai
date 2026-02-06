import React, { createContext, useContext, useState } from 'react';
import type { WrongAnswer } from '@/types';

interface LastQuizWrongContextType {
  wrongAnswers: WrongAnswer[] | null;
  setWrongAnswers: (w: WrongAnswer[] | null) => void;
}

const LastQuizWrongContext = createContext<LastQuizWrongContextType | null>(null);

export function LastQuizWrongProvider({ children }: { children: React.ReactNode }) {
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[] | null>(null);
  return (
    <LastQuizWrongContext.Provider value={{ wrongAnswers, setWrongAnswers }}>
      {children}
    </LastQuizWrongContext.Provider>
  );
}

export function useLastQuizWrong() {
  const ctx = useContext(LastQuizWrongContext);
  if (!ctx) throw new Error('useLastQuizWrong must be used within LastQuizWrongProvider');
  return ctx;
}
