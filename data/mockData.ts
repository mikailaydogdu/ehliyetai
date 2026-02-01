import { Category, Lesson, Question } from '@/types';
import {
  getEhliyetQuestions,
  getQuestionsByCategory as getByCategory,
} from '@/data/ehliyetSorulari';
import { getIsaretQuestions } from '@/data/isaretSorulari';

const QUIZ_QUESTION_COUNT = 10;

/** Resmi sınav formatı: 50 soru, 60 dakika (kullanıcıya 45 dk gösterilebilir). */
export const EXAM_TOTAL_QUESTIONS = 50;
export const EXAM_DURATION_MINUTES = 45;
export const EXAM_ILK_YARDIM = 12;
export const EXAM_TRAFIK_ADABI = 6;
export const EXAM_TRAFIK = 23; // Trafik ve Çevre Bilgisi (içinde işaret levhası soruları da var)
export const EXAM_MOTOR = 9;

/** Geçme: en az 35 doğru = 70 puan. Yanlış doğruyu götürmez. */
export const EXAM_PASS_MIN_CORRECT = 35;
export const EXAM_PASS_PERCENT = 70;

/** Sınav hakları: 4 teori, 4 direksiyon; hepsi bitince dosya yanar. */
export const EXAM_THEORY_ATTEMPTS = 4;
export const EXAM_DRIVING_ATTEMPTS = 4;

/** Trafik 23 sorunun kaçı metin, kaçı işaret levhası (görselli) */
const EXAM_TRAFIK_TEXT = 18;
const EXAM_ISARET_IN_EXAM = 5;

/** Eğitim içeriği: her kategori için başlık + açıklama (lesson) blokları. */
const educationLessons: Record<string, Lesson[]> = {
  trafik: [
    { id: 'trafik-1', order: 1, title: 'Hız Kuralları', content: 'Yerleşim yeri içinde 50 km/s, yerleşim yeri dışında 90 km/s, bölünmüş yollarda 110 km/s hız sınırlarına uyulmalıdır. Hız sınırı işaretleriyle belirtilen farklı limitler varsa onlar geçerlidir.', questions: [] },
    { id: 'trafik-2', order: 2, title: 'Takip Mesafesi', content: 'Öndeki aracı güvenli bir mesafeden takip etmek gerekir. Hızın yarısı kadar metre (örn. 90 km/s’de en az 45 m) veya 2 saniye kuralı uygulanır: Öndeki aracın geçtiği noktaya 2 saniyeden önce varmamalısınız.', questions: [] },
    { id: 'trafik-3', order: 3, title: 'Geçiş Üstünlüğü', content: 'Ambulans, itfaiye, polis gibi görevli araçlar ışıklı ve sesli işaret verdiğinde yol vermek zorunludur. Kavşaklarda sağdan gelen araçlara, ana yoldaysanız tali yoldan gelenlere üstünlük vardır.', questions: [] },
  ],
  ilkyardim: [
    { id: 'ilkyardim-1', order: 1, title: 'İlk Yardımın ABC\'si', content: 'A: Hava yolu açıklığı kontrol edilir. B: Solunum değerlendirilir. C: Dolaşım (nabız, kanama) kontrol edilir. Bilinçsiz kazazedede önce 112 aranır, sonra temel yaşam desteği uygulanır.', questions: [] },
    { id: 'ilkyardim-2', order: 2, title: 'Kanama ve Şok', content: 'Kanamada yara üzerine temiz bezle baskı yapılır; gerekirse turnike uygulanır. Şokta hasta sırt üstü yatırılır, ayaklar 30 cm yukarı kaldırılır, vücut ısısı korunur.', questions: [] },
    { id: 'ilkyardim-3', order: 3, title: 'Kırık ve Çıkık', content: 'Kırık şüphesinde uzuv hareket ettirilmez, atel veya destekle sabitlenir. Çıkıkta yerine oturtulmaya çalışılmaz; soğuk uygulama ve sabitleme yapılır.', questions: [] },
  ],
  motor: [
    { id: 'motor-1', order: 1, title: 'Motor Parçaları', content: 'Motor; silindir, piston, krank mili, supap ve ateşleme sistemi gibi parçalardan oluşur. Dört zamanlı motorda emme, sıkıştırma, ateşleme ve egzoz zamanları çalışır.', questions: [] },
    { id: 'motor-2', order: 2, title: 'Yağlama ve Soğutma', content: 'Motor yağı sürtünmeyi azaltır ve aşınmayı önler. Soğutma sistemi (radyatör, su pompası) motorun aşırı ısınmasını engeller. Yağ ve antifriz seviyeleri düzenli kontrol edilmelidir.', questions: [] },
    { id: 'motor-3', order: 3, title: 'Fren Sistemi', content: 'Disk ve kampana frenler ana fren sistemini oluşturur. ABS (kilitlenme önleyici) tekerleklerin kilitlenmesini engelleyerek fren mesafesini ve kontrolü iyileştirir.', questions: [] },
  ],
  trafikadabi: [
    { id: 'trafikadabi-1', order: 1, title: 'Saygı ve Sabır', content: 'Trafikte diğer sürücü ve yayalara saygı göstermek, sinirli davranmamak ve sabırlı olmak hem güvenliği hem de toplumsal huzuru artırır.', questions: [] },
    { id: 'trafikadabi-2', order: 2, title: 'Yaya Önceliği', content: 'Yaya geçitlerinde ve kavşaklarda yayalara yol vermek yasal zorunluluktur. Yayaların güvenli geçişini beklemek trafik adabının gereğidir.', questions: [] },
    { id: 'trafikadabi-3', order: 3, title: 'Işık ve Korna Kullanımı', content: 'Geceleyin gerekmedikçe uzun far kullanılmamalı; karşıdan gelen sürücüyü rahatsız etmemek gerekir. Korna sadece uyarı amacıyla ve zorunlu hallerde kullanılmalıdır.', questions: [] },
  ],
  kurallar: [
    { id: 'kurallar-1', order: 1, title: 'Ehliyet Sınıfları', content: 'B sınıfı otomobil ve kamyonet kullanımı içindir. M, A1, A2, A motosiklet; C kamyon; D otobüs; E römorklu araçlar için verilir. Sınıf dışı araç kullanmak yasaktır.', questions: [] },
    { id: 'kurallar-2', order: 2, title: 'Ceza ve Puan', content: 'Trafik ihlallerinde para cezası ve ceza puanı uygulanır. Belirli puana ulaşan sürücülerin ehliyeti süreli olarak alınabilir.', questions: [] },
    { id: 'kurallar-3', order: 3, title: 'Alkol ve Uyuşturucu', content: 'Alkol ve uyuşturucu etkisi altında araç kullanmak yasaktır. Kan alkol limiti 0.50 promil; sıfır alkol uygulaması olan gruplar da vardır.', questions: [] },
  ],
  isaretler: [
    { id: 'isaretler-1', order: 1, title: 'Tehlike ve Uyarı İşaretleri', content: 'Üçgen, kırmızı çerçeveli işaretler uyarı amaçlıdır: viraj, kavşak, yaya geçidi, hayvan çıkabilir vb. Sürücü hızını düşürüp dikkatli olmalıdır.', questions: [] },
    { id: 'isaretler-2', order: 2, title: 'Yasak ve Zorunluluk İşaretleri', content: 'Yuvarlak, kırmızı çerçeveli işaretler yasak; mavi zeminli yuvarlak işaretler zorunluluk bildirir (örn. mecburi yön, kask zorunlu).', questions: [] },
    { id: 'isaretler-3', order: 3, title: 'Bilgi ve Yön İşaretleri', content: 'Dikdörtgen, mavi veya yeşil işaretler bilgi ve yönlendirme içindir: otoyol, yerleşim, tesis ve mesafe bilgisi verir.', questions: [] },
  ],
  bakim: [
    { id: 'bakim-1', order: 1, title: 'Günlük Kontroller', content: 'Farlar, sinyaller, lastik hava basıncı, yağ ve soğutma suyu seviyeleri her gün veya yolculuk öncesi kontrol edilmelidir.', questions: [] },
    { id: 'bakim-2', order: 2, title: 'Periyodik Bakım', content: 'Belirli km veya sürelerde yağ ve filtre değişimi, fren ve süspansiyon kontrolü yaptırılmalıdır. Bakım kartı işlenerek kayıt tutulur.', questions: [] },
    { id: 'bakim-3', order: 3, title: 'Lastik ve Fren', content: 'Lastik diş derinliği yasal minimum 1,6 mm’dir. Fren balataları ve diskleri aşınma sınırına gelmeden değiştirilmelidir.', questions: [] },
  ],
};

/** Kategoriler (kısa açıklama + tıklanınca o kategorinin 10 soruluk sınavı). */
export const mockCategories: Category[] = [
  {
    id: 'trafik',
    order: 1,
    name: 'Trafik',
    icon: 'car',
    description: 'Trafik kuralları, işaretler ve güvenli sürüş ile ilgili sorular.',
    lessons: educationLessons.trafik ?? [],
  },
  {
    id: 'ilkyardim',
    order: 2,
    name: 'İlk Yardım',
    icon: 'medkit',
    description: 'İlk yardım temel bilgisi, kanama, kırık ve şok durumları ile ilgili sorular.',
    lessons: educationLessons.ilkyardim ?? [],
  },
  {
    id: 'motor',
    order: 3,
    name: 'Motor',
    icon: 'construct',
    description: 'Araç tekniği, motor ve bakım ile ilgili sorular.',
    lessons: educationLessons.motor ?? [],
  },
  {
    id: 'trafikadabi',
    order: 4,
    name: 'Trafik Adabı',
    icon: 'people',
    description: 'Trafik adabı ve saygı ile ilgili sorular.',
    lessons: educationLessons.trafikadabi ?? [],
  },
  {
    id: 'kurallar',
    order: 5,
    name: 'Kurallar',
    icon: 'gavel',
    description: 'Yasal düzenlemeler ve trafik kuralları ile ilgili sorular.',
    lessons: educationLessons.kurallar ?? [],
  },
  {
    id: 'isaretler',
    order: 6,
    name: 'İşaretler',
    icon: 'traffic',
    description: 'Yol ve trafik işaretlerinin anlamları ile ilgili sorular.',
    lessons: educationLessons.isaretler ?? [],
  },
  {
    id: 'bakim',
    order: 7,
    name: 'Araç Bakımı',
    icon: 'build',
    description: 'Periyodik bakım ve araç kontrolleri ile ilgili sorular.',
    lessons: educationLessons.bakim ?? [],
  },
];

/** Sınavda gösterilecek azami soru sayısı. */
export const QUIZ_MAX_QUESTIONS = QUIZ_QUESTION_COUNT;

/**
 * Görselli sorular:
 * - İşaretler: data/tabela/*.png + tabelaImages.ts + isaretSorulari.ts (imageCode).
 * - Diğer kategoriler (Trafik, İlk Yardım, Motor, Trafik Adabı): veri kaynaklarında (ehliyetSorulari, veri.json, yeni.json) görsel alanı yok; sadece metin soruları. Gerçek sınavlarda bazen gösterge paneli vb. görselli sorular çıkabiliyor; ileride imageCode benzeri alan ve görsel klasörü eklenebilir.
 */
/** Ana sayfadaki bazı kategoriler aynı soru havuzunu kullanır (kurallar→trafik, bakim→motor). İşaretler kendi görselli sorularını kullanır. */
const CATEGORY_TO_SOURCE: Record<string, string> = {
  kurallar: 'trafik',
  bakim: 'motor',
};

/** Kategoriye tıklanınca: o kategorinin soruları (en fazla 10). İşaretler için görselli "Bu işaret ne anlama gelir?" soruları. */
export function getQuestionsByCategory(categoryId: string): Question[] {
  if (categoryId === 'isaretler') {
    return getIsaretQuestions(QUIZ_MAX_QUESTIONS);
  }
  const sourceId = CATEGORY_TO_SOURCE[categoryId] ?? categoryId;
  return getByCategory(sourceId).slice(0, QUIZ_MAX_QUESTIONS);
}

/** Resmi sınav: İlk Yardım 12, Trafik Adabı 6, Trafik 23, Motor 9 = 50 soru (karışık). */
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Resmi dağılım: İlk Yardım 12, Trafik Adabı 6, Trafik ve Çevre 23 (metin + işaret levhası), Motor 9 = 50 soru. */
export function getMixedQuestionsForQuiz(): Question[] {
  const all = getEhliyetQuestions();
  const byCategory: Record<string, Question[]> = {};
  all.forEach((q) => {
    if (!byCategory[q.categoryId]) byCategory[q.categoryId] = [];
    byCategory[q.categoryId].push(q);
  });
  const ilkyardim = shuffleArray(byCategory['ilkyardim'] ?? []).slice(0, EXAM_ILK_YARDIM);
  const trafikadabi = shuffleArray(byCategory['trafikadabi'] ?? []).slice(0, EXAM_TRAFIK_ADABI);
  const trafikText = shuffleArray(byCategory['trafik'] ?? []).slice(0, EXAM_TRAFIK_TEXT);
  const trafikIsaret = getIsaretQuestions(EXAM_ISARET_IN_EXAM);
  const trafik = shuffleArray([...trafikText, ...trafikIsaret]);
  const motor = shuffleArray(byCategory['motor'] ?? []).slice(0, EXAM_MOTOR);
  const combined = [...ilkyardim, ...trafikadabi, ...trafik, ...motor];
  if (__DEV__ && combined.length !== EXAM_TOTAL_QUESTIONS) {
    console.warn(
      `[getMixedQuestionsForQuiz] Beklenen ${EXAM_TOTAL_QUESTIONS} soru, gelen ${combined.length}. ` +
        `Dağılım: İlkYardım=${ilkyardim.length} TrafikAdabı=${trafikadabi.length} Trafik=${trafik.length} Motor=${motor.length}`
    );
  }
  return shuffleArray(combined);
}


/** Tüm sorular (karışık değil, sıralı – geriye uyumluluk). */
export function getAllQuestions(): Question[] {
  return getEhliyetQuestions();
}
