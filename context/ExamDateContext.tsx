import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getExamDate, setExamDate as setExamDateStorage } from '@/lib/localStorage';

interface ExamDateContextType {
  examDate: string | null;
  setExamDate: (date: string | null) => Promise<void>;
  daysLeft: number | null;
  reloadFromStorage: () => Promise<void>;
}

const ExamDateContext = createContext<ExamDateContextType | null>(null);

function daysBetween(from: string, to: string): number {
  const d1 = new Date(from);
  const d2 = new Date(to);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.floor((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000));
}

export function ExamDateProvider({ children }: { children: React.ReactNode }) {
  const [examDate, setExamDateState] = useState<string | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    getExamDate().then((date) => {
      setExamDateState(date);
      if (date) {
        const today = new Date().toISOString().slice(0, 10);
        setDaysLeft(daysBetween(today, date));
      } else {
        setDaysLeft(null);
      }
    });
  }, []);

  const setExamDate = useCallback(async (date: string | null) => {
    await setExamDateStorage(date);
    setExamDateState(date);
    if (date) {
      const today = new Date().toISOString().slice(0, 10);
      setDaysLeft(daysBetween(today, date));
    } else {
      setDaysLeft(null);
    }
  }, []);

  const reloadFromStorage = useCallback(async () => {
    const date = await getExamDate();
    setExamDateState(date);
    if (date) {
      const today = new Date().toISOString().slice(0, 10);
      setDaysLeft(daysBetween(today, date));
    } else {
      setDaysLeft(null);
    }
  }, []);

  const value: ExamDateContextType = { examDate, setExamDate, daysLeft, reloadFromStorage };

  return (
    <ExamDateContext.Provider value={value}>{children}</ExamDateContext.Provider>
  );
}

export function useExamDate() {
  const ctx = useContext(ExamDateContext);
  if (!ctx) throw new Error('useExamDate must be used within ExamDateProvider');
  return ctx;
}
