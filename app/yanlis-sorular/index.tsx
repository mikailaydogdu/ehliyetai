import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius, TOUCH_TARGET_MIN } from '@/constants/theme';
import { useWrongQuestions } from '@/context/WrongQuestionsContext';

type CategoryGroup = { categoryId: string; categoryName: string; count: number };

export default function YanlisSorularIndexScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { wrongQuestions } = useWrongQuestions();

  const categories = useMemo(() => {
    const byCategory = new Map<string, { categoryName: string; count: number }>();
    wrongQuestions.forEach((q) => {
      const existing = byCategory.get(q.categoryId);
      if (existing) {
        existing.count += 1;
      } else {
        byCategory.set(q.categoryId, { categoryName: q.categoryName, count: 1 });
      }
    });
    return Array.from(byCategory.entries())
      .map(([categoryId, { categoryName, count }]) => ({ categoryId, categoryName, count }))
      .sort((a, b) => b.count - a.count);
  }, [wrongQuestions]);

  if (wrongQuestions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Geri"
            accessibilityHint="Önceki sayfaya dön">
            <MaterialIcons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>Yanlış Yaptığım Sorular</Text>
        </View>
        <View style={styles.emptyWrap}>
          <MaterialIcons name="assignment" size={64} color={c.icon} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>Henüz yanlış soru yok</Text>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            Sınav veya kategori testi çöz; yanlış yaptığın sorular burada birikir ve kategorilere göre
            tekrar çözebilirsin.
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: c.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.8}>
            <Text style={[styles.backButtonText, { color: c.primaryContrast }]}>Anasayfaya dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Geri"
          accessibilityHint="Önceki sayfaya dön">
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Yanlış Yaptığım Sorular</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
          Kategoriye tıklayarak soruları çöz
        </Text>
        {categories.map(({ categoryId, categoryName, count }) => (
          <TouchableOpacity
            key={categoryId}
            style={[styles.categoryCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}
            onPress={() => router.push({ pathname: '/yanlis-sorular/[category]', params: { category: categoryId, categoryName } } as never)}
            activeOpacity={0.7}>
            <Text style={[styles.categoryName, { color: c.text }]} numberOfLines={1}>
              {categoryName}
            </Text>
            <View style={[styles.badge, { backgroundColor: c.primary }]}>
              <Text style={[styles.badgeText, { color: c.primaryContrast }]}>{count}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={c.textSecondary} />
          </TouchableOpacity>
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
  headerTitle: { fontSize: 17, fontWeight: '600', flex: 1 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm, textAlign: 'center' },
  emptyText: { textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg },
  backButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  sectionTitle: { fontSize: 14, marginBottom: Spacing.md },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  categoryName: { flex: 1, fontSize: 16, fontWeight: '600' },
  badge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  badgeText: { fontSize: 14, fontWeight: '700' },
});
