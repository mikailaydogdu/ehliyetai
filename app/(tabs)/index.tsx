import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, getCardShadow, Spacing } from '@/constants/theme';
import { useExamDate } from '@/context/ExamDateContext';
import { mockCategories } from '@/data/mockData';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  car: 'directions-car',
  medkit: 'medical-services',
  construct: 'build',
  people: 'people',
  gavel: 'gavel',
  traffic: 'traffic',
  build: 'build',
};

const GAP = Spacing.md;
const PADDING_H = Spacing.lg;

export default function AnasayfaScreen() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { daysLeft } = useExamDate();
  const contentWidth = width - PADDING_H * 2;
  const cardWidth = (contentWidth - GAP) / 2;

  const daysText =
    daysLeft !== null
      ? daysLeft > 0
        ? `Sınava ${daysLeft} gün kaldı`
        : daysLeft === 0
          ? 'Sınav bugün!'
          : 'Sınav tarihi geçti'
      : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          {daysText && (
            <View style={[styles.daysLeftBadge, { backgroundColor: c.selectedBg }]}>
              <Text style={[styles.daysLeftText, { color: c.text }]}>{daysText}</Text>
            </View>
          )}
          <View style={styles.bannerRow}>
            <View style={styles.bannerLeft}>
              <Text style={[styles.bannerTitle, { color: c.text }]}>Hoş geldiniz</Text>
              <Text style={[styles.bannerSubtitle, { color: c.textSecondary }]}>
                Kategorilerden birini seçerek test çözmeye başlayın.
              </Text>
            </View>
            <View style={styles.bannerRight}>
              <View style={[styles.illustration, { backgroundColor: c.selectedBg }]}>
                <MaterialIcons name="school" size={56} color={c.text} />
              </View>
            </View>
          </View>
        </View>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Kategoriler</Text>
        </View>
        <View style={styles.grid}>
          {mockCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                {
                  ...getCardShadow(c),
                  backgroundColor: c.card,
                  borderColor: c.border,
                  width: cardWidth,
                  borderRadius: BorderRadius.xl,
                  borderWidth: 1,
                },
              ]}
              onPress={() => router.push({ pathname: '/quiz', params: { category: cat.id } } as never)}
              activeOpacity={0.7}>
              <View style={[styles.categoryIconWrap, { backgroundColor: c.selectedBg }]}>
                <MaterialIcons
                  name={CATEGORY_ICONS[cat.icon] ?? 'folder'}
                  size={30}
                  color={c.text}
                />
              </View>
              <Text style={[styles.categoryName, { color: c.text }]} numberOfLines={2}>
                {cat.name}
              </Text>
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
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  heroBlock: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  daysLeftBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    marginBottom: Spacing.sm,
  },
  daysLeftText: { fontSize: 15, fontWeight: '700' },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bannerLeft: { flex: 1, paddingRight: Spacing.md },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  bannerRight: { justifyContent: 'flex-end' },
  illustration: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  viewAll: { fontSize: 13 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    minHeight: 112,
  },
  categoryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 2,
  },
});
