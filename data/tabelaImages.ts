/**
 * Yerel trafik işareti görselleri – data/tabela/*.png
 * Metro statik require istediği için her dosya sabit yol ile require edilir.
 */

import type { ImageSourcePropType } from 'react-native';

/** Kod -> yerel görsel (require). */
const TABELA_IMAGES: Record<string, ImageSourcePropType> = {
  // Tehlike
  'T-1a': require('./tabela/120px-Turkey_road_sign_T-1a-svg.png'),
  'T-1b': require('./tabela/120px-Turkey_road_sign_T-1b-svg.png'),
  'T-2a': require('./tabela/120px-Turkey_road_sign_T-2a-svg.png'),
  'T-2b': require('./tabela/120px-Turkey_road_sign_T-2b-svg.png'),
  'T-3a': require('./tabela/120px-Turkey_road_sign_T-3a-svg.png'),
  'T-3b': require('./tabela/120px-Turkey_road_sign_T-3b-svg.png'),
  'T-4a': require('./tabela/120px-Turkey_road_sign_T-4a-svg.png'),
  'T-4b': require('./tabela/120px-Turkey_road_sign_T-4b-svg.png'),
  'T-4c': require('./tabela/120px-Turkey_road_sign_T-4c-svg.png'),
  'T-5': require('./tabela/120px-Turkey_road_sign_T-5-svg.png'),
  'T-6': require('./tabela/120px-Turkey_road_sign_T-6-svg.png'),
  'T-7': require('./tabela/120px-Turkey_road_sign_T-7-svg.png'),
  'T-8': require('./tabela/120px-Turkey_road_sign_T-8-svg.png'),
  'T-9': require('./tabela/120px-Turkey_road_sign_T-9-svg.png'),
  'T-10': require('./tabela/120px-Turkey_road_sign_T-10-svg.png'),
  'T-11': require('./tabela/120px-Turkey_road_sign_T-11-svg.png'),
  'T-12': require('./tabela/120px-Turkey_road_sign_T-12-svg.png'),
  'T-13': require('./tabela/120px-Turkey_road_sign_T-13-svg.png'),
  'T-14a': require('./tabela/120px-Turkey_road_sign_T-14a-svg.png'),
  'T-14b': require('./tabela/120px-Turkey_road_sign_T-14b-svg.png'),
  'T-15': require('./tabela/120px-Turkey_road_sign_T-15-svg.png'),
  'T-16': require('./tabela/120px-Turkey_road_sign_T-16-svg.png'),
  'T-17': require('./tabela/120px-Turkey_road_sign_T-17-svg.png'),
  'T-18': require('./tabela/120px-Turkey_road_sign_T-18-svg.png'),
  'T-19': require('./tabela/120px-Turkey_road_sign_T-19-svg.png'),
  'T-20': require('./tabela/120px-Turkey_road_sign_T-20-svg.png'),
  'T-21': require('./tabela/120px-Turkey_road_sign_T-21-svg.png'),
  'T-22a': require('./tabela/120px-Turkey_road_sign_T-22a-svg.png'),
  'T-22b': require('./tabela/120px-Turkey_road_sign_T-22b-svg.png'),
  'T-22c': require('./tabela/120px-Turkey_road_sign_T-22c-svg.png'),
  'T-22d': require('./tabela/120px-Turkey_road_sign_T-22d-svg.png'),
  'T-22e': require('./tabela/120px-Turkey_road_sign_T-22e-svg.png'),
  'T-23a': require('./tabela/120px-Turkey_road_sign_T-23a-svg.png'),
  'T-23b': require('./tabela/120px-Turkey_road_sign_T-23b-svg.png'),
  'T-24': require('./tabela/120px-Turkey_road_sign_T-24-svg.png'),
  'T-25': require('./tabela/120px-Turkey_road_sign_T-25-svg.png'),
  'T-26': require('./tabela/120px-Turkey_road_sign_T-26-svg.png'),
  'T-27a': require('./tabela/120px-Turkey_road_sign_T-27a-svg.png'),
  'T-27b': require('./tabela/120px-Turkey_road_sign_T-27b-svg.png'),
  'T-32': require('./tabela/120px-Turkey_road_sign_T-32-svg.png'),
  'T-36': require('./tabela/120px-Turkey_road_sign_T-36-svg.png'),
  'T-37': require('./tabela/120px-Turkey_road_sign_T-37-svg.png'),
  'T-38': require('./tabela/120px-Turkey_road_sign_T-38-svg.png'),
  'T-39': require('./tabela/120px-Turkey_road_sign_T-39-svg.png'),
  // Tanzim
  'TT-1': require('./tabela/120px-Turkey_road_sign_TT-1-svg.png'),
  'TT-2': require('./tabela/120px-Turkey_road_sign_TT-2-svg.png'),
  'TT-2a': require('./tabela/120px-Turkey_road_sign_TT-2a-svg.png'),
  'TT-3': require('./tabela/120px-Turkey_road_sign_TT-3-svg.png'),
  'TT-4': require('./tabela/120px-Turkey_road_sign_TT-4-svg.png'),
  'TT-5': require('./tabela/120px-Turkey_road_sign_TT-5-svg.png'),
  'TT-6': require('./tabela/120px-Turkey_road_sign_TT-6-svg.png'),
  'TT-7': require('./tabela/120px-Turkey_road_sign_TT-7-svg.png'),
  'TT-8': require('./tabela/120px-Turkey_road_sign_TT-8-svg.png'),
  'TT-10a': require('./tabela/120px-Turkey_road_sign_TT-10a-svg.png'),
  'TT-10b': require('./tabela/120px-Turkey_road_sign_TT-10b-svg.png'),
  'TT-12': require('./tabela/120px-Turkey_road_sign_TT-12-svg.png'),
  'TT-18': require('./tabela/120px-Turkey_road_sign_TT-18-svg.png'),
  'TT-19': require('./tabela/120px-Turkey_road_sign_TT-19-svg.png'),
  'TT-26a': require('./tabela/120px-Turkey_road_sign_TT-26a-svg.png'),
  'TT-26b': require('./tabela/120px-Turkey_road_sign_TT-26b-svg.png'),
  'TT-26c': require('./tabela/120px-Turkey_road_sign_TT-26c-svg.png'),
  'TT-27': require('./tabela/120px-Turkey_road_sign_TT-27-svg.png'),
  'TT-29a': require('./tabela/120px-Turkey_road_sign_TT-29-50-svg.png'),
  'TT-29b': require('./tabela/120px-Turkey_road_sign_TT-29b-svg.png'),
  'TT-30': require('./tabela/120px-Turkey_road_sign_TT-30-svg.png'),
  'TT-31': require('./tabela/120px-Turkey_road_sign_TT-31-svg.png'),
  'TT-32': require('./tabela/120px-Turkey_road_sign_TT-32-svg.png'),
  'TT-35a': require('./tabela/120px-Turkey_road_sign_TT-35a-svg.png'),
  'TT-35b': require('./tabela/120px-Turkey_road_sign_TT-35b-svg.png'),
  'TT-35c': require('./tabela/120px-Turkey_road_sign_TT-35c-svg.png'),
  'TT-37': require('./tabela/120px-Turkey_road_sign_TT-37-svg.png'),
  'TT-38a': require('./tabela/120px-Turkey_road_sign_TT-38a-svg.png'),
  'TT-39a': require('./tabela/120px-Turkey_road_sign_TT-39a-svg.png'),
  'TT-42a': require('./tabela/120px-Turkey_road_sign_TT-42a-svg.png'),
  // Bilgi
  'B-2a': require('./tabela/120px-Turkey_road_sign_B-2a-svg.png'),
  'B-4': require('./tabela/120px-Turkey_road_sign_B-4-svg.png'),
  'B-9': require('./tabela/120px-Turkey_road_sign_B-9-svg.png'),
  'B-10': require('./tabela/120px-Turkey_road_sign_B-10-svg.png'),
  'B-14a': require('./tabela/120px-Turkey_road_sign_B-14a-svg.png'),
  'B-14b': require('./tabela/120px-Turkey_road_sign_B-14b-svg.png'),
  'B-15': require('./tabela/120px-Turkey_road_sign_B-15-svg.png'),
  'B-16a': require('./tabela/120px-Turkey_road_sign_B-16-svg.png'),
  'B-17': require('./tabela/120px-Turkey_road_sign_B-17-svg.png'),
  'B-18': require('./tabela/120px-Turkey_road_sign_B-18-svg.png'),
  'B-19': require('./tabela/120px-Turkey_road_sign_B-19-svg.png'),
  'B-22': require('./tabela/120px-Turkey_road_sign_B-22-svg.png'),
  'B-23': require('./tabela/120px-Turkey_road_sign_B-23-svg.png'),
  'B-24': require('./tabela/120px-Turkey_road_sign_B-24-svg.png'),
  'B-26': require('./tabela/120px-Turkey_road_sign_B-26-svg.png'),
  'B-37': require('./tabela/120px-Turkey_road_sign_B-37-svg.png'),
  'B-38': require('./tabela/120px-Turkey_road_sign_B-38-svg.png'),
  'B-39': require('./tabela/120px-Turkey_road_sign_B-39-svg.png'),
  'B-40': require('./tabela/120px-Turkey_road_sign_B-40-svg.png'),
  'B-41': require('./tabela/120px-Turkey_road_sign_B-41-svg.png'),
  'B-49a': require('./tabela/120px-Turkey_road_sign_B-49-svg.png'),
  'B-52a': require('./tabela/120px-Turkey_road_sign_B-52-svg.png'),
  'B-56': require('./tabela/120px-Turkey_road_sign_B-56-svg.png'),
  // Durma-park
  'P-1': require('./tabela/120px-Turkey_road_sign_P-1-svg.png'),
  'P-2': require('./tabela/120px-Turkey_road_sign_P-2-svg.png'),
  'P-3a': require('./tabela/120px-Turkey_road_sign_P-3a-svg.png'),
  'P-3f': require('./tabela/120px-Turkey_road_sign_P-3f-svg.png'),
  // Yapım bakım
  'T-16p': require('./tabela/120px-Turkey_road_sign_YBT-16-svg.png'),
  'TT-3p': require('./tabela/120px-Turkey_road_sign_YBTT-3-svg.png'),
  'YB-3': require('./tabela/120px-Turkey_road_sign_YB-3-svg.png'),
  'YB-4a': require('./tabela/120px-Turkey_road_sign_YB-4a-svg.png'),
  'YB-7a': require('./tabela/120px-Turkey_road_sign_YB-7a-svg.png'),
  // Paneller (TR_road_sign)
  'PL-1': require('./tabela/120px-TR_road_sign_PL-1-svg.png'),
  'PL-2': require('./tabela/120px-TR_road_sign_PL-2-svg.png'),
  'PL-4': require('./tabela/120px-TR_road_sign_PL-4-svg.png'),
  'PL-5': require('./tabela/120px-TR_road_sign_PL-5-svg.png'),
  'PL-6': require('./tabela/120px-TR_road_sign_PL-6-svg.png'),
  'PL-8a': require('./tabela/120px-TR_road_sign_PL-8-1-svg.png'),
  'PL-9a': require('./tabela/120px-TR_road_sign_PL-9-1-svg.png'),
  'PL-11a': require('./tabela/120px-TR_road_sign_PL-11-1-svg.png'),
  'PL-18': require('./tabela/120px-TR_road_sign_PL-18-svg.png'),
};

export function getTabelaImage(code: string): ImageSourcePropType | undefined {
  return TABELA_IMAGES[code];
}

/**
 * image_code → görüntülenebilir kaynak.
 *  • http(s) URL → direkt URI
 *  • Tabela kodu (T-1a vb.) → yerel require
 */
export function getQuestionImageSource(code: string): ImageSourcePropType | undefined {
  if (!code) return undefined;
  if (code.startsWith('http://') || code.startsWith('https://')) {
    return { uri: code };
  }
  return TABELA_IMAGES[code];
}
