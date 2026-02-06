import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius, TOUCH_TARGET_MIN } from '@/constants/theme';

const SAYFA_ITEMS = [
  { id: 'gizlilik', label: 'Gizlilik Politikası', icon: 'privacy-tip' as const, path: '/gizlilik' },
  { id: 'kosullar', label: 'Kullanım Koşulları', icon: 'description' as const, path: '/kullanim-kosullari' },
  { id: 'sss', label: 'Sıkça Sorulan Sorular', icon: 'help-outline' as const, path: '/sikca-sorulan-sorular' },
];

export default function UygulamaHakkindaScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Geri"
        accessibilityHint="Önceki sayfaya dön">
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.text }]}>Uygulama Hakkında</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        {SAYFA_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: c.card, borderColor: c.border },
              getCardShadow(c),
              pressed && { backgroundColor: c.selectedBg },
            ]}
            onPress={() => router.push(item.path as never)}>
            <MaterialIcons name={item.icon} size={24} color={c.primary} />
            <Text style={[styles.rowLabel, { color: c.text }]}>{item.label}</Text>
            <MaterialIcons name="chevron-right" size={22} color={c.textSecondary} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    minWidth: TOUCH_TARGET_MIN,
    minHeight: TOUCH_TARGET_MIN,
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
});
