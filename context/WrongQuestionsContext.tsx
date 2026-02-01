import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedWrongQuestion, WrongAnswer } from '@/types';

const STORAGE_KEY = '@fersa_wrong_questions';

interface WrongQuestionsContextType {
  wrongQuestions: SavedWrongQuestion[];
  addWrongQuestions: (items: WrongAnswer[]) => void;
  removeWrongQuestion: (questionId: string) => void;
}

const WrongQuestionsContext = createContext<WrongQuestionsContextType | null>(null);

function isSavedWrongQuestion(w: WrongAnswer): w is SavedWrongQuestion {
  return Array.isArray(w.options) && w.options.length >= 2;
}

export function WrongQuestionsProvider({ children }: { children: React.ReactNode }) {
  const [wrongQuestions, setWrongQuestions] = useState<SavedWrongQuestion[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw) as WrongAnswer[];
          const valid = parsed.filter(isSavedWrongQuestion) as SavedWrongQuestion[];
          setWrongQuestions(valid);
        } catch (_) {}
      })
      .catch(() => {});
  }, []);

  const addWrongQuestions = useCallback(
    (items: WrongAnswer[]) => {
      const withOptions = items.filter(isSavedWrongQuestion) as SavedWrongQuestion[];
      if (withOptions.length === 0) return;
      setWrongQuestions((prev) => {
        const byId = new Map(prev.map((q) => [q.questionId, q]));
        withOptions.forEach((q) => byId.set(q.questionId, q));
        const next = Array.from(byId.values());
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const removeWrongQuestion = useCallback(
    (questionId: string) => {
      setWrongQuestions((prev) => {
        const next = prev.filter((q) => q.questionId !== questionId);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  return (
    <WrongQuestionsContext.Provider
      value={{ wrongQuestions, addWrongQuestions, removeWrongQuestion }}>
      {children}
    </WrongQuestionsContext.Provider>
  );
}

export function useWrongQuestions() {
  const ctx = useContext(WrongQuestionsContext);
  if (!ctx) throw new Error('useWrongQuestions must be used within WrongQuestionsProvider');
  return ctx;
}
