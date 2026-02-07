import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getWrongQuestions, setWrongQuestions as setWrongQuestionsStorage } from '@/lib/localStorage';
import type { SavedWrongQuestion, WrongAnswer } from '@/types';

interface WrongQuestionsContextType {
  wrongQuestions: SavedWrongQuestion[];
  addWrongQuestions: (items: WrongAnswer[]) => Promise<void>;
  removeWrongQuestion: (questionId: string) => Promise<void>;
  updateWrongQuestionNote: (questionId: string, note: string) => Promise<void>;
  reloadFromStorage: () => Promise<void>;
}

const WrongQuestionsContext = createContext<WrongQuestionsContextType | null>(null);

function toSavedWrongQuestion(item: WrongAnswer): SavedWrongQuestion {
  return {
    ...item,
    options: item.options ?? [],
  };
}

export function WrongQuestionsProvider({ children }: { children: React.ReactNode }) {
  const [wrongQuestions, setWrongQuestionsState] = useState<SavedWrongQuestion[]>([]);

  useEffect(() => {
    getWrongQuestions().then(setWrongQuestionsState);
  }, []);

  const addWrongQuestions = useCallback(
    async (items: WrongAnswer[]) => {
      if (items.length === 0) return;
      const saved = items.map(toSavedWrongQuestion);
      const byId = new Map(wrongQuestions.map((q) => [q.questionId, q]));
      saved.forEach((q) => byId.set(q.questionId, q));
      const merged = Array.from(byId.values());
      setWrongQuestionsState(merged);
      await setWrongQuestionsStorage(merged);
    },
    [wrongQuestions]
  );

  const removeWrongQuestion = useCallback(
    async (questionId: string) => {
      const filtered = wrongQuestions.filter((q) => q.questionId !== questionId);
      setWrongQuestionsState(filtered);
      await setWrongQuestionsStorage(filtered);
    },
    [wrongQuestions]
  );

  const updateWrongQuestionNote = useCallback(async (questionId: string, note: string) => {
    const list = await getWrongQuestions();
    const updated = list.map((q) =>
      q.questionId === questionId ? { ...q, aiNote: note } : q
    );
    setWrongQuestionsState(updated);
    await setWrongQuestionsStorage(updated);
  }, []);

  const reloadFromStorage = useCallback(async () => {
    const list = await getWrongQuestions();
    setWrongQuestionsState(list);
  }, []);

  const value: WrongQuestionsContextType = {
    wrongQuestions,
    addWrongQuestions,
    removeWrongQuestion,
    updateWrongQuestionNote,
    reloadFromStorage,
  };

  return (
    <WrongQuestionsContext.Provider value={value}>
      {children}
    </WrongQuestionsContext.Provider>
  );
}

export function useWrongQuestions() {
  const ctx = useContext(WrongQuestionsContext);
  if (!ctx) throw new Error('useWrongQuestions must be used within WrongQuestionsProvider');
  return ctx;
}
