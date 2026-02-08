// Driving license exam – data types (JSON-compatible)

export interface Lesson {
  id: string;
  order: number;
  title: string;
  /** Short summary (one sentence). */
  summary?: string;
  content: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  categoryId: string;
  lessonId?: string;
  explanation?: string;
  /** Sign questions: traffic sign image code (örn. T-1a). Varsa quiz’te görsel gösterilir. */
  imageCode?: string;
  /** Option images (4-item array; undefined if no image). */
  optionImages?: (string | undefined)[];
}

export interface Category {
  id: string;
  order: number;
  name: string;
  icon: string;
  description?: string;
  /** Category short summary (shown at top of lesson page). */
  summary?: string;
  lessons: Lesson[];
}

/** Quiz result – for stats */
export interface QuizResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  wrongAnswers: WrongAnswer[];
  /** Which exam: "Daily Exam", "Full Exam 1", category name, etc. */
  examLabel?: string;
}

export interface WrongAnswer {
  questionId: string;
  questionText: string;
  categoryId: string;
  categoryName: string;
  selectedIndex: number;
  correctIndex: number;
  /** Options for wrong-questions list (saved when quiz ends). */
  options?: string[];
  /** Image code if sign question. */
  imageCode?: string;
  /** Option images. */
  optionImages?: (string | undefined)[];
  /** AI-generated note for this question (stored locally). */
  aiNote?: string;
}

/** Saved wrong question – shown on wrong-questions screen with options/imageCode. */
export type SavedWrongQuestion = WrongAnswer & { options: string[] };
