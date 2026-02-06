import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius } from '@/constants/theme';
import { useContent } from '@/context/ContentContext';

const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  car: 'directions-car',
  medkit: 'medical-services',
  construct: 'build',
  people: 'people',
  gavel: 'gavel',
  traffic: 'traffic',
  build: 'build',
};

export default function CalismaIndexScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { categories } = useContent();

  const onCategoryPress = (categoryId: string, categoryName: string) => {
    router.push({ pathname: '/calisma/[category]', params: { category: categoryId, categoryName } } as never);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          <TouchableOpacity
            style={[styles.card, styles.karisikCard, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }, getCardShadow(c)]}
            onPress={() => onCategoryPress('karisik', 'Karışık (tüm kategoriler)')}
            activeOpacity={0.7}>
            <View style={[styles.badge, { backgroundColor: c.primary }]}>
              <MaterialIcons name="shuffle" size={20} color={c.primaryContrast} />
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: c.text }]}>Karışık</Text>
              <Text style={[styles.cardHint, { color: c.textSecondary }]}>
                Tüm kategorilerden karışık AI soruları
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={c.textSecondary} />
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.card, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }, getCardShadow(c)]}
              onPress={() => onCategoryPress(cat.id, cat.name)}
              activeOpacity={0.7}>
              <View style={[styles.badge, { backgroundColor: c.primary }]}>
                <MaterialIcons name={CATEGORY_ICONS[cat.icon] ?? 'folder'} size={20} color={c.primaryContrast} />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: c.text }]}>{cat.name}</Text>
                <Text style={[styles.cardHint, { color: c.textSecondary }]}>AI ile çalış</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={c.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing.xl,
  },
  list: { gap: Spacing.sm },
  karisikCard: { marginTop: Spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  badge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardHint: { fontSize: 12, marginTop: 2 },
});
