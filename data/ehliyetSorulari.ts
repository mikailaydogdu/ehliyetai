/**
 * Fersa ehliyet sınavı soruları - JSON formatından uygulama formatına dönüştürülür.
 * Ocak 2026 soruları ehliyet.io / mebehliyetsinavsorulari kaynaklarından eklenmiştir.
 */

import { Question } from '@/types';
import { ocak2026Sorulari } from '@/data/ehliyetSorulariOcak';
import { veriSorulari } from '@/data/veriSorulari';
import { yeniSorulari } from '@/data/yeniSorulari';

export const ehliyetSorulariMeta = {
  title: 'Fersa ehliyet sınavı soruları',
  last_updated: '2026-01-31',
};

const LETTER_TO_INDEX: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };

// Kategori ataması: 1-9 İlk Yardım, 10-11 Trafik, 12-13 Motor
function getCategoryForIndex(index: number): string {
  if (index < 9) return 'ilkyardim';
  if (index < 11) return 'trafik';
  return 'motor';
}

export interface RawQuestion {
  question: string;
  options: { a: string; b: string; c: string; d: string };
  answer: 'a' | 'b' | 'c' | 'd';
  explanation?: string;
  /** Resmi dağılım: ilkyardim, trafikadabi, trafik, motor */
  categoryId?: 'ilkyardim' | 'trafikadabi' | 'trafik' | 'motor';
}

export const rawQuestions: RawQuestion[] = [
  {
    question:
      'Kan şekeri ciddi şekilde düştüğünde, hangi belirti birinci derecede görülür?',
    options: {
      a: 'Tokluk hissi',
      b: 'Yavaş nabız',
      c: 'Görmede netlik',
      d: 'Yüzeysel solunum',
    },
    answer: 'd',
    explanation:
      'Kan şekeri düşükken beyine giden oksijen azalır ve solunum yüzeysel hale gelir; diğer seçenekler ters etkilerdir.',
  },
  {
    question: 'Şok durumundaki hastanın pozisyonunda hangi amaçla ayaklar yukarı kaldırılır?',
    options: {
      a: 'Sindirime yardımcı olmak',
      b: 'Vücut sıcaklığını düşürmek',
      c: 'Solunumun düzenli olmasını sağlamak',
      d: 'Beyne yeterince kan gitmesini sağlamak',
    },
    answer: 'd',
    explanation:
      'Ayakları yukarı kaldırmak, yer çekimiyle kanı beyne yönlendirerek hayati organlara daha fazla oksijen gitmesini sağlar.',
  },
  {
    question:
      'Dıştan veya içten etki ile kemiğin anatomik bütünlüğünün bozulması nedir?',
    options: {
      a: 'Kırık',
      b: 'Çıkık',
      c: 'Donma',
      d: 'Burkulma',
    },
    answer: 'a',
    explanation:
      'Kırık, kemiğin bütünlüğünün bozulmasıdır; çıkık ve burkulma eklem, donma ise soğuğa bağlı doku hasarıdır.',
  },
  {
    question: 'Açık kırık tanımı ile ilgili aşağıdakilerden hangisi doğrudur?',
    options: {
      a: 'Deri bütünlüğü bozulmuştur',
      b: 'Kanama ve enfeksiyon tehlikesi yoktur',
      c: 'Kemik cildi delmez',
      d: 'İç kanama yoktur',
    },
    answer: 'a',
    explanation:
      'Açık kırıkta cilt yarılır ve kemiğin dış ortama bağlandığı için deri bütünlüğü bozulmuş olur; kanama ve enfeksiyon riski vardır.',
  },
  {
    question:
      'Yaralı taşınırken hangi davranış hayati risk oluşturabileceğinden kesinlikle kaçınılmalıdır?',
    options: {
      a: 'Kendi can güvenliğini riske atmak',
      b: 'Kazazedeyi mümkün olduğunca çok hareket ettirmek',
      c: 'Yön değiştirirken ani dönme ve bükülmelerden kaçınmak',
      d: 'Baş-boyun-gövde eksenini korumak',
    },
    answer: 'c',
    explanation:
      'Kazazedeyi taşırken ani dönme ve bükülmelerden kaçınmak gerekir; bu hareketler hem ilk yardımcının hem kazazedenin bel ve omurga hasarına sebep olabilir.',
  },
  {
    question: 'Hangi durumda kazazedeye kesinlikle sedye ile müdahale edilmelidir?',
    options: {
      a: 'Kolunda yara ve kırık olan',
      b: 'Birinci derece yanığı olan',
      c: 'Omurgasında kırık olan',
      d: 'Kaburgasında kırık olan',
    },
    answer: 'c',
    explanation:
      'Omurga kırığı şüphesi taşıyan bir yaralı—aynı eksen korunarak ve sabit tutularak—sedye ile taşınmalıdır çünkü yanlış hareket felce yol açabilir.',
  },
  {
    question: 'Kalp durduğunda hangi belirti en erken görülür?',
    options: {
      a: 'Göz bebeklerinin genişlemesi',
      b: 'Solunumun yüzeyselleşmesi',
      c: 'Kan basıncının artması',
      d: 'Nabzın yavaşlaması',
    },
    answer: 'a',
    explanation:
      'Kalp durduğunda beyne yeterli kan gitmez ve otonom sistem etkilenir; göz bebekleri genişler ve ışığa tepki vermez.',
  },
  {
    question:
      'Hangisi atardamar kanamasının diğer kanama türlerine göre farkıdır?',
    options: {
      a: 'Burun kanamasıdır',
      b: 'Parçalı akışla parlak kırmızı kan gelir',
      c: 'Kan yavaşça akar',
      d: 'Koyu kırmızıdır',
    },
    answer: 'b',
    explanation:
      'Atardamar kanaması, kalbin her atışında fışkıran yüksek basınçlı parlak kırmızı kan akar ve kısa sürede şoka neden olabilir.',
  },
  {
    question: 'Turnike kullanımı hangi durumda tercih edilmez?',
    options: {
      a: 'Uzuv kopması varsa',
      b: 'Baskı noktalarında basınç yeterliyse',
      c: 'Çok sayıda kazazedeye aynı anda yardım gerekiyorsa',
      d: 'Kanaması durdurulamayan bir kazazede taşınıyorsa',
    },
    answer: 'b',
    explanation:
      'Doğrudan baskı veya baskı noktalarına basınç yeterliyse turnike gibi dokuya zarar verebilecek yöntemlere ihtiyaç yoktur.',
  },
  {
    question:
      'Emniyet kemeri takmamanın sonuçlarını en eksiksiz şekilde hangi seçenek açıklar?',
    options: {
      a: 'Yalnız I (araç içinde savrulma)',
      b: 'I ve II (savrulma ve araçtan fırlama)',
      c: 'II ve III (araçtan fırlama ve ölüm riski)',
      d: 'I, II ve III (savrulma, fırlama, ölüm/yaralanma artışı)',
    },
    answer: 'd',
    explanation:
      'Emniyet kemeri takılmadığında önce araç içinde savrulma, sonra araçtan dışarı fırlama ve bunun sonucunda ölüm ile yaralanma riski artar; bu durum I, II ve III\'ü kapsar.',
  },
  {
    question: 'Karşıdan bir araç geldiğinde hangi far türü kullanılır?',
    options: {
      a: 'Dönüş ışıkları',
      b: 'Sis veya park ışıkları',
      c: 'Uzağı gösteren (uzun) farlar',
      d: 'Yakını gösteren (kısa) farlar',
    },
    answer: 'd',
    explanation:
      'Karşıdan gelen araç olduğunda düşük seviye ışıklar olan yakını gösteren farlar kullanılır; uzun farlar göz kamaştırır ve yasaktır.',
  },
  {
    question: 'Motorun ömrünü en fazla etkileyen unsur aşağıdakilerden hangisidir?',
    options: {
      a: 'Alaşımlı jant',
      b: 'Motor yağı kalitesi',
      c: 'Doğru yapılmış far ayarı',
      d: 'Delinmiş egzoz susturucusu',
    },
    answer: 'b',
    explanation:
      'Motor yağı kalitesi, motor parçalarının sürtünmesini azaltır, temizler ve soğutur; kalitesiz yağ doğrudan aşınmaya ve motorun kilitlenmesine yol açar.',
  },
  {
    question: 'Yakıt pompası sembolü yandığında ne anlamalıyız?',
    options: {
      a: 'Akü şarj sistemi arızalı',
      b: 'Yağ basıncı düşük',
      c: 'Yakıt seviyesi azaldı ve yedek depo kullanılıyor',
      d: 'Arka sis lambası açık',
    },
    answer: 'c',
    explanation:
      'Benzin pompası sembolü, yakıt deposunun azaldığını ve araç yakında yakıt almamız gerektiğini gösterir; yaklaşık 50-100 km daha yol alınabilir.',
  },
  ...ocak2026Sorulari,
  ...veriSorulari,
  ...yeniSorulari,
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * JSON formatındaki soruları uygulama Question formatına çevirir.
 */
export function getEhliyetQuestions(): Question[] {
  return rawQuestions.map((rq, index) => {
    const options = [rq.options.a, rq.options.b, rq.options.c, rq.options.d];
    const correctIndex = LETTER_TO_INDEX[rq.answer];
    return {
      id: `ehliyet-${index + 1}`,
      text: rq.question,
      options,
      correctIndex,
      categoryId: rq.categoryId ?? getCategoryForIndex(index),
      explanation: rq.explanation,
    };
  });
}

/** Belirli bir kategorinin sorularını döndürür (kategoriye tıklanınca). */
export function getQuestionsByCategory(categoryId: string): Question[] {
  return getEhliyetQuestions().filter((q) => q.categoryId === categoryId);
}

/** Tüm soruları karışık sırada döndürür (Sınav sekmesinde). */
export function getMixedQuestions(): Question[] {
  return shuffleArray(getEhliyetQuestions());
}
