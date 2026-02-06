/**
 * Firebase Realtime Database'den gelen ham veriyi uygulama formatına çevirir.
 */

import { fetchNotesFromFirebase, fetchQuestionsFromFirebase } from '@/lib/firebase';
import type { Lesson, Question } from '@/types';

const LETTER_TO_INDEX: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

interface FirebaseQuestion {
  id?: string;
  question?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  answer?: string;
  category_id?: string;
  explanation?: string;
  /** Görsel sorularda dosya adı veya kod (örn. soru39.gif). */
  image_code?: string;
  /** Şık görselleri (Vercel Blob path veya URL). */
  option_a_image?: string;
  option_b_image?: string;
  option_c_image?: string;
  option_d_image?: string;
}

interface FirebaseNote {
  id?: string;
  category_id?: string;
  order?: number;
  title?: string;
  summary?: string;
  content?: string;
}

function mapFirebaseQuestionToQuestion(raw: FirebaseQuestion, index: number): Question {
  const answer = (raw.answer ?? 'a').toLowerCase();
  const options = [
    raw.option_a ?? '',
    raw.option_b ?? '',
    raw.option_c ?? '',
    raw.option_d ?? '',
  ];
  const optionImages: (string | undefined)[] = [
    raw.option_a_image,
    raw.option_b_image,
    raw.option_c_image,
    raw.option_d_image,
  ];
  const hasOptionImages = optionImages.some(Boolean);

  return {
    id: raw.id ?? `q_${index + 1}`,
    text: raw.question ?? '',
    options,
    correctIndex: LETTER_TO_INDEX[answer] ?? 0,
    categoryId: raw.category_id ?? 'trafik',
    explanation: raw.explanation,
    imageCode: raw.image_code,
    ...(hasOptionImages ? { optionImages } : {}),
  };
}

function mapFirebaseNoteToLesson(raw: FirebaseNote): Lesson {
  return {
    id: raw.id ?? '',
    order: raw.order ?? 0,
    title: raw.title ?? '',
    summary: raw.summary,
    content: raw.content ?? '',
    questions: [],
  };
}

/** Firebase'den soruları çekip Question[] döndürür. */
export async function loadQuestionsFromFirebase(): Promise<Question[]> {
  const raw = await fetchQuestionsFromFirebase();
  return raw.map((r, i) => mapFirebaseQuestionToQuestion(r as FirebaseQuestion, i));
}

/** Firebase'den notları çekip kategoriye göre gruplu döndürür: Record<categoryId, Lesson[]>. */
export async function loadNotesFromFirebase(): Promise<Record<string, Lesson[]>> {
  const raw = await fetchNotesFromFirebase();
  const byCategory: Record<string, Lesson[]> = {};
  for (const r of raw as FirebaseNote[]) {
    const cat = r.category_id ?? 'trafik';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(mapFirebaseNoteToLesson(r));
  }
  return byCategory;
}
