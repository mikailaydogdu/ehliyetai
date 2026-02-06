import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function EgitimIndexScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { categories } = useContent();
  const educationCategories = categories.filter((cat) => (cat.lessons?.length ?? 0) > 0 || cat.id === 'isaretler');

  const handleCategoryPress = (cat: (typeof categories)[0]) => {
    if (cat.id === 'isaretler') {
      router.push('/egitim/isaretler' as never);
    } else {
      router.push({ pathname: '/egitim/bos', params: { categoryId: cat.id, name: cat.name } } as never);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {educationCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.card,
              {
                ...getCardShadow(c),
                backgroundColor: c.card,
                borderColor: c.border,
                borderRadius: BorderRadius.xl,
                borderWidth: 1,
              },
            ]}
            onPress={() => handleCategoryPress(cat)}
            activeOpacity={0.7}>
            <View style={[styles.iconWrap, { backgroundColor: c.selectedBg }]}>
              <MaterialIcons
                name={CATEGORY_ICONS[cat.icon] ?? 'folder'}
                size={28}
                color={c.text}
              />
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: c.text }]}>{cat.name}</Text>
              <Text style={[styles.cardDescription, { color: c.textSecondary }]} numberOfLines={2}>
                {cat.description}
              </Text>
              <Text style={[styles.cardAction, { color: c.text }]}>
                {cat.id === 'isaretler' ? 'İşaretleri görüntüle →' : 'Konu anlatımı ve özetler →'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardDescription: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  cardAction: { fontSize: 13, fontWeight: '600' },
});
