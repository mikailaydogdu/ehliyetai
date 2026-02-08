/**
 * Firebase Realtime Database connection.
 * Questions and notes are read from here; question reports are written.
 */

import { getDatabase, ref, get, push, set, type Database } from 'firebase/database';
import { initializeApp, type FirebaseApp } from 'firebase/app';

const FIREBASE_CONFIG = {
  databaseURL: 'https://ehliyetai-e3b91-default-rtdb.firebaseio.com',
  // databaseURL is enough for Realtime Database read; add apiKey from Firebase Console if needed.
};

let app: FirebaseApp | null = null;
let db: Database | null = null;

function getDb(): Database {
  if (!db) {
    app = initializeApp(FIREBASE_CONFIG);
    db = getDatabase(app);
  }
  return db;
}

/** Reads question array from a single path. */
async function fetchPath(path: string): Promise<unknown[]> {
  const database = getDb();
  const snapshot = await get(ref(database, path));
  const val = snapshot.val();
  if (val == null) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'object') return Object.values(val);
  return [];
}

/** Returns all questions from Firebase. */
export async function fetchQuestionsFromFirebase(): Promise<unknown[]> {
  return fetchPath('questions');
}

/** Fetches notes array from Firebase. */
export async function fetchNotesFromFirebase(): Promise<unknown[]> {
  return fetchPath('notes');
}

export type ReportReason =
  | 'soru_yanlis'
  | 'soru_hatali'
  | 'cevap_yanlis'
  | 'cevap_yanlis_isaretlenmis'
  | 'diger';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'soru_yanlis', label: 'Soru yanlış' },
  { value: 'soru_hatali', label: 'Soru hatalı' },
  { value: 'cevap_yanlis', label: 'Cevap yanlış' },
  { value: 'cevap_yanlis_isaretlenmis', label: 'Cevap yanlış işaretlenmiş' },
  { value: 'diger', label: 'Diğer' },
];

/** Question report: adds new record to reports path. */
export async function submitQuestionReport(payload: {
  questionId: string;
  reason: ReportReason;
  questionText?: string;
  categoryId?: string;
}): Promise<void> {
  const database = getDb();
  const reportsRef = ref(database, 'reports');
  const newRef = push(reportsRef);
  await set(newRef, {
    questionId: payload.questionId,
    reason: payload.reason,
    questionText: payload.questionText ?? null,
    categoryId: payload.categoryId ?? null,
    createdAt: new Date().toISOString(),
  });
}
