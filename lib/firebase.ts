/**
 * Firebase Realtime Database bağlantısı.
 * Sorular ve notlar buradan okunur.
 */

import { getDatabase, ref, get, type Database } from 'firebase/database';
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
