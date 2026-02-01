/**
 * İşaretler kategorisi: "Bu işaret ne anlama gelir?" tarzı sorular.
 * trafikIsaretleri + tabela görselleri kullanılır; sadece görseli olan işaretler sorulur.
 */

import type { Question } from '@/types';
import { trafikIsaretleriKategorileri } from '@/data/trafikIsaretleri';
import { getTabelaImage } from '@/data/tabelaImages';

/** Tüm kategorilerdeki işaretleri düz liste yap; sadece görseli olanları al. */
function getSignsWithImage(): { code: string; name: string }[] {
  const list: { code: string; name: string }[] = [];
  trafikIsaretleriKategorileri.forEach((kat) => {
    kat.signs.forEach((s) => {
      if (getTabelaImage(s.code)) list.push({ code: s.code, name: s.name });
    });
  });
  return list;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** İşaretler kategorisi için soru üretir: görsel + "Bu işaret ne anlama gelir?" + 4 şık. */
export function getIsaretQuestions(count: number): Question[] {
  const signs = getSignsWithImage();
  if (signs.length < 4) return [];

  const pool: Question[] = signs.map((correct) => {
    const others = signs.filter((s) => s.code !== correct.code);
    const wrongs = shuffle(others).slice(0, 3);
    const options = shuffle([correct.name, wrongs[0].name, wrongs[1].name, wrongs[2].name]);
    const correctIndex = options.indexOf(correct.name);
    return {
      id: `isaret-${correct.code}`,
      text: 'Bu işaret ne anlama gelir?',
      options,
      correctIndex,
      categoryId: 'isaretler',
      imageCode: correct.code,
    };
  });

  return shuffle(pool).slice(0, count);
}
