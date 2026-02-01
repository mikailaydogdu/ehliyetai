import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EXAM_DATE_KEY = '@fersa_exam_date';

interface ExamDateContextType {
  examDate: string | null;
  setExamDate: (date: string | null) => Promise<void>;
  daysLeft: number | null;
}

const ExamDateContext = createContext<ExamDateContextType | null>(null);

export function ExamDateProvider({ children }: { children: React.ReactNode }) {
  const [examDate, setExamDateState] = useState<string | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(EXAM_DATE_KEY).then((stored) => {
      if (stored) setExamDateState(stored);
    });
  }, []);

  useEffect(() => {
    if (!examDate) {
      setDaysLeft(null);
      return;
    }
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff);
  }, [examDate]);

  const setExamDate = useCallback(async (date: string | null) => {
    if (date) {
      await AsyncStorage.setItem(EXAM_DATE_KEY, date);
      setExamDateState(date);
    } else {
      await AsyncStorage.removeItem(EXAM_DATE_KEY);
      setExamDateState(null);
    }
  }, []);

  return (
    <ExamDateContext.Provider value={{ examDate, setExamDate, daysLeft }}>
      {children}
    </ExamDateContext.Provider>
  );
}

export function useExamDate() {
  const ctx = useContext(ExamDateContext);
  if (!ctx) throw new Error('useExamDate must be used within ExamDateProvider');
  return ctx;
}
