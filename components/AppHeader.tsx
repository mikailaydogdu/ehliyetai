import { usePathname, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/constants/theme';
import { useMenu } from '@/context/MenuContext';

const TITLE_MAP: Record<string, string> = {
  index: 'Anasayfa',
  egitim: 'Eğitim',
  calisma: 'Chat',
  sinav: 'Sınav',
  profil: 'Profil',
};

/** İç ekranlar (stack): pathname segment'ine göre başlık */
const NESTED_TITLE_MAP: Record<string, string> = {
  isaretler: 'Trafik İşaretleri',
  bos: 'Eğitim',
};

function getTitle(pathname: string): string {
  const normalized = pathname.replace(/^\/(tabs\/)?/, '');
  const segments = normalized.split('/').filter(Boolean);
  const base = segments[0] || 'index';
  if (segments.length > 1) {
    const nested = segments[1];
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
  const { open } = useMenu();
  const nested = isNestedScreen(pathname);
  const title = getTitle(pathname);

  return (
    <SafeAreaView style={[styles.safe]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: c.background, borderBottomColor: c.border }]}>
        <Pressable
          style={styles.menuBtn}
          onPress={() => (nested ? router.back() : open())}
          hitSlop={12}>
          <MaterialIcons name={nested ? 'arrow-back' : 'menu'} size={26} color={c.text} />
        </Pressable>
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
  menuBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  placeholder: { width: 34 },
});
