/**
 * Firebase Realtime Database bağlantısı.
 * Sorular ve notlar buradan okunur; soru bildirimleri (reports) yazılır.
 */

import { getDatabase, ref, get, push, set, type Database } from 'firebase/database';
import { initializeApp, type FirebaseApp } from 'firebase/app';

const FIREBASE_CONFIG = {
  databaseURL: 'https://ehliyetai-e3b91-default-rtdb.firebaseio.com',
  // Realtime Database okuma için databaseURL yeterli; gerekirse Firebase Console'dan apiKey ekleyebilirsin.
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

/** Tek bir path'ten soru dizisini okur. */
async function fetchPath(path: string): Promise<unknown[]> {
  const database = getDb();
  const snapshot = await get(ref(database, path));
  const val = snapshot.val();
  if (val == null) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'object') return Object.values(val);
  return [];
}

/** Firebase'den tüm soruları döndürür. */
export async function fetchQuestionsFromFirebase(): Promise<unknown[]> {
  return fetchPath('questions');
}

/** Firebase'den notes dizisini alır. */
export async function fetchNotesFromFirebase(): Promise<unknown[]> {
  return fetchPath('notes');
}

export type ReportReason =
  | 'soru_yanlis'
  | 'soru_hatali'
  | 'cevap_yanlis'
  | 'cevap_yanlis_isaretlenmis'
  | 'diger';

/** Soru bildirimi: reports path'ine yeni kayıt ekler. */
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
