// B Ehliyet Sınavı - Veri tipleri (JSON ile uyumlu)

export interface Lesson {
  id: string;
  order: number;
  title: string;
  content: string; // Konu anlatımı
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
  /** İşaret sorularında: tabela görseli kodu (örn. T-1a). Varsa quiz’te görsel gösterilir. */
  imageCode?: string;
}

export interface Category {
  id: string;
  order: number;
  name: string;
  icon: string;
  description?: string; // Kategoriye tıklanınca gösterilen kısa açıklama
  lessons: Lesson[];
}

// Sınav sonucu - istatistikler için
export interface QuizResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  wrongAnswers: WrongAnswer[];
}

export interface WrongAnswer {
  questionId: string;
  questionText: string;
  categoryId: string;
  categoryName: string;
  selectedIndex: number;
  correctIndex: number;
  /** Yanlış sorular listesinde tekrar çözmek için şıklar (quiz bitince kaydedilir). */
  options?: string[];
  /** İşaret sorusu ise görsel kodu. */
  imageCode?: string;
}

/** Kaydedilmiş yanlış soru – tekrar çözme ekranında gösterilmek üzere options/imageCode ile. */
export type SavedWrongQuestion = WrongAnswer & { options: string[] };
