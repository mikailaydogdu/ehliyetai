/**
 * yeni.json'dan dönüştürülen sorular – mock data'ya eklenir.
 * Kategori: İlkyardım, Trafik ve Çevre, Araç Tekniği, Trafik Adabı
 */

import type { RawQuestion } from '@/data/ehliyetSorulari';

interface YeniItem {
  id: number;
  kategori: string;
  soru: string;
  secenekler: { A: string; B: string; C: string; D: string };
  cevap: string;
}

const KATEGORI_TO_ID: Record<string, 'ilkyardim' | 'trafik' | 'motor' | 'trafikadabi'> = {
  'İlkyardım': 'ilkyardim',
  'Trafik ve Çevre': 'trafik',
  'Araç Tekniği': 'motor',
  'Trafik Adabı': 'trafikadabi',
};

const yeniJson = require('./yeni.json') as YeniItem[];

export const yeniSorulari: RawQuestion[] = yeniJson.map((item) => {
  const categoryId = KATEGORI_TO_ID[item.kategori] ?? 'trafik';
  return {
    question: item.soru,
    options: {
      a: item.secenekler.A,
      b: item.secenekler.B,
      c: item.secenekler.C,
      d: item.secenekler.D,
    },
    answer: item.cevap.toLowerCase() as 'a' | 'b' | 'c' | 'd',
    categoryId,
  };
});
