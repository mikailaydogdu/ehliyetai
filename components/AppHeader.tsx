import { usePathname, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, TOUCH_TARGET_MIN } from '@/constants/theme';

const TITLE_MAP: Record<string, string> = {
  index: 'Anasayfa',
  egitim: 'Notlar',
  calisma: 'EhliyetAI',
  sinav: 'Sınav',
  profil: 'Profil',
};

/** Eğitim stack iç ekranları */
const NESTED_TITLE_MAP: Record<string, string> = {
  isaretler: 'Trafik İşaretleri',
  bos: 'Notlar',
};

/** EhliyetAI kategori ekranları */
const CALISMA_TITLE_MAP: Record<string, string> = {
  karisik: 'Karışık',
  motor: 'Motor',
  trafik: 'Trafik ve Çevre',
  ilkyardim: 'İlk Yardım',
  trafikadabi: 'Trafik Adabı',
  kurallar: 'Kurallar',
  isaretler: 'İşaretler',
  bakim: 'Araç Tekniği',
};

/** Virgülle ayrılmış kategori ID'lerini başlığa çevir */
function getCalismaTitle(nested: string): string {
  const ids = nested.split(',').filter(Boolean);
  if (ids.length === 1) return CALISMA_TITLE_MAP[ids[0]] ?? ids[0];
  if (ids.length <= 3) return ids.map((id) => CALISMA_TITLE_MAP[id] ?? id).join(', ');
  return `${ids.length} Kategori`;
}

function getTitle(pathname: string): string {
  const normalized = pathname.replace(/^\/(tabs\/)?/, '');
  const segments = normalized.split('/').filter(Boolean);
  const base = segments[0] || 'index';
  if (segments.length > 1) {
    const nested = segments[1];
    if (base === 'calisma') {
      return getCalismaTitle(nested);
    }
    return NESTED_TITLE_MAP[nested] ?? TITLE_MAP[base] ?? 'B Ehliyet';
  }
  return TITLE_MAP[base] ?? 'B Ehliyet';
}

function isNestedScreen(pathname: string): boolean {
  const normalized = pathname.replace(/^\/(tabs\/)?/, '');
  return normalized.split('/').filter(Boolean).length > 1;
}

export default function AppHeader() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const pathname = usePathname();
  const nested = isNestedScreen(pathname);
  const title = getTitle(pathname);

  return (
    <SafeAreaView style={[styles.safe]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: c.background, borderBottomColor: c.border }]}>
        {nested ? (
          <Pressable
            style={styles.menuBtn}
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityLabel="Geri"
            accessibilityHint="Önceki sayfaya dön">
            <MaterialIcons name="arrow-back" size={26} color={c.text} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.placeholder} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  menuBtn: {
    minWidth: TOUCH_TARGET_MIN,
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -4,
  },
  title: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  placeholder: { width: 34 },
});
