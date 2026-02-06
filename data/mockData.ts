import { Category, Lesson } from '@/types';

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
export const EXAM_TRAFIK_TEXT = 18;
export const EXAM_ISARET_IN_EXAM = 5;

/** Notlar: Sadece işaretler burada (Firebase'e eklenmeyecek, realtime ekleyeceksiniz). Diğer kategorilerin notları Firebase'den yüklenecek. */
const educationLessons: Record<string, Lesson[]> = {
  isaretler: [
    { id: 'isaretler-1', order: 1, title: 'Tehlike ve Uyarı İşaretleri', summary: 'Üçgen kırmızı çerçeve: viraj, kavşak, yaya geçidi vb.', content: 'Üçgen, kırmızı çerçeveli işaretler uyarı amaçlıdır: viraj, kavşak, yaya geçidi, hayvan çıkabilir vb. Sürücü hızını düşürüp dikkatli olmalıdır.', questions: [] },
    { id: 'isaretler-2', order: 2, title: 'Yasak ve Zorunluluk İşaretleri', summary: 'Kırmızı çerçeve yasak; mavi zemin zorunluluk.', content: 'Yuvarlak, kırmızı çerçeveli işaretler yasak; mavi zeminli yuvarlak işaretler zorunluluk bildirir (örn. mecburi yön, kask zorunlu).', questions: [] },
    { id: 'isaretler-3', order: 3, title: 'Bilgi ve Yön İşaretleri', summary: 'Dikdörtgen mavi/yeşil: bilgi ve yön.', content: 'Dikdörtgen, mavi veya yeşil işaretler bilgi ve yönlendirme içindir: otoyol, yerleşim, tesis ve mesafe bilgisi verir.', questions: [] },
    { id: 'isaretler-4', order: 4, title: 'Yol Çizgileri', summary: 'Kesik çizgi geçilebilir; düz çizgi geçilemez.', content: 'Yoldaki kesik çizgiler güvenli durumlarda sollama yapılabileceğini, devamlı düz çizgiler ise şerit değiştirmenin yasak olduğunu belirtir.', questions: [] },
    { id: 'isaretler-5', order: 5, title: 'Dur ve Yol Ver', summary: 'Sekizgen kırmızı "DUR"; ters üçgen "YOL VER".', content: 'Dur levhası (sekizgen) tam bir duruş gerektirir. Yol ver (ters üçgen) ise ana yoldakilere öncelik tanınması gerektiğini bildirir.', questions: [] },
    { id: 'isaretler-6', order: 6, title: 'Park Etme İşaretleri', summary: 'P harfi park; çizgi varsa park yasak.', content: 'Mavi kare "P" park yerini gösterir. Üzerinde tek kırmızı çizgi varsa duraklama yapılabilir ama park edilemez; çarpı varsa ikisi de yasaktır.', questions: [] },
    { id: 'isaretler-7', order: 7, title: 'Gabari ve Sınırlar', summary: 'Yükseklik, genişlik ve ağırlık sınırları.', content: 'Köprü altları veya dar yollar için yükseklik (oklar üstte-altta) veya genişlik (oklar yanda) sınırlarını gösteren levhalardır.', questions: [] },
    { id: 'isaretler-8', order: 8, title: 'Demiryolu Geçitleri', summary: 'Kontrollü ve kontrolsüz hemzemin geçitler.', content: 'Çit sembolü bariyerli (kontrollü), buharlı tren sembolü bariyersiz (kontrolsüz) demiryolu geçidini temsil eder.', questions: [] },
    { id: 'isaretler-9', order: 9, title: 'Trafik Tanzim İşaretleri', summary: 'Girişi olmayan yol, motosiklet hariç kapalı yol vb.', content: 'Kırmızı yuvarlak içindeki semboller o yolun kimlere veya hangi eylemlere kapalı olduğunu gösterir.', questions: [] },
    { id: 'isaretler-10', order: 10, title: 'Yatay İşaretlemeler', summary: 'Yaya geçidi, bisiklet yolu, yavaşlama uyarı çizgileri.', content: 'Asfaltın üzerine çizilen yaya geçidi ("zebra"), yön okları ve yavaşlama uyarı çizgileri de birer trafik işaretidir.', questions: [] },
    { id: 'isaretler-11', order: 11, title: 'Yol Çizgileri (Yatay)', summary: 'Düz çizgi: geçilmez, kesik çizgi: geçilebilir.', content: 'Yoldaki devamlı (düz) çizgiler şerit değiştirmenin yasak olduğunu, kesik çizgiler ise güvenli hallerde geçilebileceğini bildirir.', questions: [] },
    { id: 'isaretler-12', order: 12, title: 'Bilgi İşaretleri', summary: 'Mavi ve kare levhalar.', content: 'Otoyol çıkışları, meskun mahal isimleri, hastane, akaryakıt istasyonu gibi bilgileri veren genellikle mavi zeminli işaretlerdir.', questions: [] },
    { id: 'isaretler-13', order: 13, title: 'Yol Ver ve Dur İşaretleri', summary: 'Ters üçgen ve sekizgen levha.', content: 'Ters üçgen "Yol Ver" demektir, tali yoldadır. Kırmızı sekizgen "DUR" levhası ise mutlaka tam duruş yapılması gerektiğini bildirir.', questions: [] },
    { id: 'isaretler-14', order: 14, title: 'Gabari İşaretleri', summary: 'Yükseklik ve genişlik sınırlamaları.', content: 'Alt geçitlerde yüksekliği (örneğin 3.50m) veya dar köprülerde genişliği (2.30m) sınırlayan kırmızı çerçeveli yuvarlak levhalardır.', questions: [] },
    { id: 'isaretler-15', order: 15, title: 'Trafik Tanzim İşaretleri', summary: 'Yasaklamaları ve kısıtlamaları bildirir.', content: 'Genellikle yuvarlak ve kırmızı çerçevelidir. Girişi olmayan yol, motosiklet hariç kapalı yol gibi emirler içerir.', questions: [] },
    { id: 'isaretler-16', order: 16, title: 'Tehlikeli Viraj İşaretleri', summary: 'Keskin viraj yönünü belirtir.', content: 'Siyah zemin üzerine beyaz oklarla virajın yönünü ve keskinliğini bildirir. Bu levhaları görünce hız azaltılmalıdır.', questions: [] },
    { id: 'isaretler-17', order: 17, title: 'Okul ve Yaya Geçidi', summary: 'Yaya önceliğini hatırlatır.', content: 'Mavi kare levha içindeki yürüyen insan veya çocuk figürleri, yaya veya okul geçidine yaklaşıldığını bildirir.', questions: [] },
    { id: 'isaretler-18', order: 18, title: 'Azami Hız Sınırlaması', summary: 'Yuvarlak kırmızı çerçeve içindeki rakam.', content: 'O yolda gidilebilecek en yüksek hızı belirtir. Eğer gri renkte ve üzeri çiziliyse hız sınırlamasının sona erdiğini bildirir.', questions: [] },
    { id: 'isaretler-19', order: 19, title: 'Duraklama ve Park Yasakları', summary: 'Kırmızı çapraz veya tek çizgi.', content: 'Yuvarlak mavi zemin üzerine bir kırmızı çizgi "Park Yasak", çapraz iki çizgi ise "Duraklama ve Park Yasak" demektir.', questions: [] },
    { id: 'isaretler-20', order: 20, title: 'Mecburi Yön İşaretleri', summary: 'Mavi yuvarlak levhalar.', content: 'Sadece belirtilen yöne gidilmesi gerektiğini bildirir (Örn: Sadece sağa mecburi yön). Sürücü başka yöne dönemez.', questions: [] },
  ],
};

/** Aşağıdaki kategorilerin notları Firebase'den yüklenecek; burada boş bırakıldı. */
const emptyLessons: Lesson[] = [];
/** Kategoriler (kısa açıklama + tıklanınca o kategorinin 10 soruluk sınavı). */
export const mockCategories: Category[] = [
  {
    id: 'trafik',
    order: 1,
    name: 'Trafik',
    icon: 'car',
    description: 'Trafik kuralları, işaretler ve güvenli sürüş ile ilgili sorular.',
    summary: 'Hız, takip mesafesi ve geçiş üstünlüğü kurallarını bilmek güvenli sürüş için temeldir.',
    lessons: emptyLessons,
  },
  {
    id: 'ilkyardim',
    order: 2,
    name: 'İlk Yardım',
    icon: 'medkit',
    description: 'İlk yardım temel bilgisi, kanama, kırık ve şok durumları ile ilgili sorular.',
    summary: 'ABC (hava yolu, solunum, dolaşım), kanama-şok ve kırık-çıkıkta ilk müdahale hayat kurtarır.',
    lessons: emptyLessons,
  },
  {
    id: 'motor',
    order: 3,
    name: 'Motor',
    icon: 'construct',
    description: 'Araç tekniği, motor ve bakım ile ilgili sorular.',
    summary: 'Motor parçaları, yağlama-soğutma ve fren sistemi bilgisi sınavda ve günlük kullanımda işe yarar.',
    lessons: emptyLessons,
  },
  {
    id: 'trafikadabi',
    order: 4,
    name: 'Trafik Adabı',
    icon: 'people',
    description: 'Trafik adabı ve saygı ile ilgili sorular.',
    summary: 'Saygı, sabır, yaya önceliği ve doğru ışık-korna kullanımı trafik kültürünün parçasıdır.',
    lessons: emptyLessons,
  },
  {
    id: 'kurallar',
    order: 5,
    name: 'Kurallar',
    icon: 'gavel',
    description: 'Yasal düzenlemeler ve trafik kuralları ile ilgili sorular.',
    summary: 'Ehliyet sınıfları, ceza-puan sistemi ve alkol-uyuşturucu yasakları bilinmelidir.',
    lessons: emptyLessons,
  },
  {
    id: 'isaretler',
    order: 6,
    name: 'İşaretler',
    icon: 'traffic',
    description: 'Yol ve trafik işaretlerinin anlamları ile ilgili sorular.',
    summary: 'Uyarı, yasak, zorunluluk ve bilgi işaretlerini tanımak güvenli sürüş için şarttır.',
    lessons: educationLessons.isaretler ?? [],
  },
  {
    id: 'bakim',
    order: 7,
    name: 'Araç Bakımı',
    icon: 'build',
    description: 'Periyodik bakım ve araç kontrolleri ile ilgili sorular.',
    summary: 'Günlük ve periyodik bakım, lastik ve fren kontrolleri aracın güvenliği için önemlidir.',
    lessons: emptyLessons,
  },
];

/** Sınavda gösterilecek azami soru sayısı. */
export const QUIZ_MAX_QUESTIONS = QUIZ_QUESTION_COUNT;

/**
 * Görselli sorular:
 * - İşaretler: data/tabela/*.png + tabelaImages.ts + isaretSorulari.ts (imageCode).
 * - Diğer kategoriler (Trafik, İlk Yardım, Motor, Trafik Adabı): Firebase'den gelen metin soruları. İleride imageCode benzeri alan eklenebilir.
 */
/** Fisher–Yates karıştırma – Tekrar’da yeni sıra için kullanılır. */
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

