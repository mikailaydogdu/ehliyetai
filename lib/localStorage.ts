/**
 * Profile and quiz data stored locally with AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizResult, SavedWrongQuestion } from '@/types';

const KEY_ONBOARDING = '@fersa_onboarding_done';
const KEY_ADS_ONBOARDING_ACCEPTED = '@fersa_ads_onboarding_accepted';
const KEY_PROFILE_NAME = '@fersa_profile_name';
const KEY_EXAM_DATE = '@fersa_exam_date';
const KEY_WRONG_QUESTIONS = '@fersa_wrong_questions';
const KEY_QUIZ_RESULTS = '@fersa_quiz_results';
const MAX_QUIZ_RESULTS = 10;
const KEY_COMPLETED_FULL_EXAMS = '@fersa_completed_full_exams';
const KEY_TOTAL_QUESTIONS_COMPLETED = '@fersa_total_questions_completed';

export async function getOnboardingDone(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEY_ONBOARDING);
  return v === 'true';
}

export async function setOnboardingDone(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY_ONBOARDING, value ? 'true' : 'false');
}

export async function getAdsOnboardingAccepted(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEY_ADS_ONBOARDING_ACCEPTED);
  return v === 'true';
}

export async function setAdsOnboardingAccepted(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY_ADS_ONBOARDING_ACCEPTED, value ? 'true' : 'false');
}

export async function getProfileName(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_PROFILE_NAME);
}

export async function setProfileName(name: string | null): Promise<void> {
  if (name == null) await AsyncStorage.removeItem(KEY_PROFILE_NAME);
  else await AsyncStorage.setItem(KEY_PROFILE_NAME, name);
}

export async function getExamDate(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_EXAM_DATE);
}

export async function setExamDate(date: string | null): Promise<void> {
  if (date == null) await AsyncStorage.removeItem(KEY_EXAM_DATE);
  else await AsyncStorage.setItem(KEY_EXAM_DATE, date);
}

export async function getWrongQuestions(): Promise<SavedWrongQuestion[]> {
  const raw = await AsyncStorage.getItem(KEY_WRONG_QUESTIONS);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function setWrongQuestions(items: SavedWrongQuestion[]): Promise<void> {
  await AsyncStorage.setItem(KEY_WRONG_QUESTIONS, JSON.stringify(items));
}

export async function getQuizResults(): Promise<QuizResult[]> {
  const raw = await AsyncStorage.getItem(KEY_QUIZ_RESULTS);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    const list = Array.isArray(arr) ? arr : [];
    if (list.length <= MAX_QUIZ_RESULTS) return list;
    const trimmed = list.slice(0, MAX_QUIZ_RESULTS);
    await AsyncStorage.setItem(KEY_QUIZ_RESULTS, JSON.stringify(trimmed));
    return trimmed;
  } catch {
    return [];
  }
}

export async function addQuizResultLocal(
  result: {
    score: number;
    totalQuestions: number;
    wrongAnswers: QuizResult['wrongAnswers'];
    examLabel?: string;
  }
): Promise<void> {
  const existing = await getQuizResults();
  const newItem: QuizResult = {
    id: `local_${Date.now()}`,
    date: new Date().toISOString(),
    score: result.score,
    totalQuestions: result.totalQuestions,
    wrongAnswers: result.wrongAnswers,
    examLabel: result.examLabel,
  };
  const updated = [newItem, ...existing].slice(0, MAX_QUIZ_RESULTS);
  await AsyncStorage.setItem(KEY_QUIZ_RESULTS, JSON.stringify(updated));

  const totalSoFar = await getTotalQuestionsCompleted();
  await AsyncStorage.setItem(KEY_TOTAL_QUESTIONS_COMPLETED, String(totalSoFar + result.totalQuestions));
}

/** Total questions completed (all time, not limited to last 10 quizzes). */
export async function getTotalQuestionsCompleted(): Promise<number> {
  const v = await AsyncStorage.getItem(KEY_TOTAL_QUESTIONS_COMPLETED);
  if (v != null) {
    const n = parseInt(v, 10);
    if (!Number.isNaN(n) && n >= 0) return n;
  }
  const list = await getQuizResults();
  const sum = list.reduce((s, r) => s + r.totalQuestions, 0);
  await AsyncStorage.setItem(KEY_TOTAL_QUESTIONS_COMPLETED, String(sum));
  return sum;
}

/** Tam sınav listesi: tamamlanan sınav numaraları (1–20). Sınav 2’ye ancak Sınav 1 tamamlandıktan sonra gidilir. */
export async function getCompletedFullExams(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(KEY_COMPLETED_FULL_EXAMS);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((n) => typeof n === 'number' && n >= 1 && n <= 20) : [];
  } catch {
    return [];
  }
}

export async function markFullExamCompleted(examIndex: number): Promise<void> {
  if (examIndex < 1 || examIndex > 20) return;
  const list = await getCompletedFullExams();
  if (list.includes(examIndex)) return;
  const updated = [...list, examIndex].sort((a, b) => a - b);
  await AsyncStorage.setItem(KEY_COMPLETED_FULL_EXAMS, JSON.stringify(updated));
}

/** Clears all profile data (name, exam date, wrong questions, quiz results, completed full exams). Onboarding is not cleared. */
export async function clearAllProfileData(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEY_PROFILE_NAME,
    KEY_EXAM_DATE,
    KEY_WRONG_QUESTIONS,
    KEY_QUIZ_RESULTS,
    KEY_COMPLETED_FULL_EXAMS,
    KEY_TOTAL_QUESTIONS_COMPLETED,
  ]);
}
