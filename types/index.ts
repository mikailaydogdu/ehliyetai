// B Ehliyet Sınavı - Veri tipleri (JSON ile uyumlu)

export interface Lesson {
  id: string;
  order: number;
  title: string;
  /** Kısa özet (bir cümle). */
  summary?: string;
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
  /** Şık görselleri (4 elemanlı dizi; görsel yoksa undefined). */
  optionImages?: (string | undefined)[];
}

export interface Category {
  id: string;
  order: number;
  name: string;
  icon: string;
  description?: string; // Kategoriye tıklanınca gösterilen kısa açıklama
  /** Kategori kısa özeti (konu anlatımı sayfasında üstte). */
  summary?: string;
  lessons: Lesson[];
}

// Sınav sonucu - istatistikler için
export interface QuizResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  wrongAnswers: WrongAnswer[];
  /** Hangi sınav: "Günün Sınavı", "Tam Sınav 1", kategori adı vb. */
  examLabel?: string;
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
  /** Şık görselleri. */
  optionImages?: (string | undefined)[];
  /** Yapay zeka ile üretilen, soruyla ilgili not (yerelde saklanır). */
  aiNote?: string;
}

/** Kaydedilmiş yanlış soru – tekrar çözme ekranında gösterilmek üzere options/imageCode ile. */
export type SavedWrongQuestion = WrongAnswer & { options: string[] };
