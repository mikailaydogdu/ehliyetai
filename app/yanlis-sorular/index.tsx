import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
import type { SavedWrongQuestion } from '@/types';

const PAGE_SIZE = 10;

type CategoryGroup = { categoryId: string; categoryName: string; count: number };
type TabId = 'sorular' | 'notlar';

export default function YanlisSorularIndexScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { wrongQuestions } = useWrongQuestions();
  const [activeTab, setActiveTab] = useState<TabId>('sorular');
  const [visibleCategories, setVisibleCategories] = useState(PAGE_SIZE);
  const [visibleNotes, setVisibleNotes] = useState(PAGE_SIZE);

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

  const questionsWithNotes = useMemo(
    () => wrongQuestions.filter((q): q is SavedWrongQuestion & { aiNote: string } => Boolean(q.aiNote)),
    [wrongQuestions]
  );

  const notesByCategory = useMemo(() => {
    const byCategory = new Map<string, (SavedWrongQuestion & { aiNote: string })[]>();
    questionsWithNotes.forEach((q) => {
      const list = byCategory.get(q.categoryId) ?? [];
      list.push(q);
      byCategory.set(q.categoryId, list);
    });
    return Array.from(byCategory.entries()).map(([categoryId, list]) => {
      const categoryName = list[0]?.categoryName ?? categoryId;
      return { categoryId, categoryName, questions: list };
    }).sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }, [questionsWithNotes]);

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
          <Text style={[styles.headerTitle, { color: c.text }]}>Yanlışlar</Text>
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
        <Text style={[styles.headerTitle, { color: c.text }]}>Yanlışlar</Text>
      </View>

      <View style={[styles.tabRow, { borderBottomColor: c.border }]}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('sorular')}
          activeOpacity={0.7}>
          <Text style={[styles.tabLabel, { color: activeTab === 'sorular' ? c.primary : c.textSecondary }]}>
            Yanlış yaptığı sorular
          </Text>
          <View style={[styles.tabUnderline, { backgroundColor: activeTab === 'sorular' ? c.primary : 'transparent' }]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('notlar')}
          activeOpacity={0.7}>
          <Text style={[styles.tabLabel, { color: activeTab === 'notlar' ? c.primary : c.textSecondary }]}>
            İlgili notlar
          </Text>
          <View style={[styles.tabUnderline, { backgroundColor: activeTab === 'notlar' ? c.primary : 'transparent' }]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        {activeTab === 'sorular' && (
          <>
            <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
              Yanlış yaptığın sorular kategoriler halinde tekrar çöz.{' '}
              <Text style={[styles.sectionTitle, { color: '#CA8A04' }]}>
                Önce İlgili notlar sekmesinden notları kontrol et.
              </Text>
            </Text>
            {categories.slice(0, visibleCategories).map(({ categoryId, categoryName, count }) => (
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
            {categories.length > visibleCategories && (
              <TouchableOpacity
                style={[styles.loadMoreBtn, { borderColor: c.border }]}
                onPress={() => setVisibleCategories((n) => n + PAGE_SIZE)}
                activeOpacity={0.7}>
                <Text style={[styles.loadMoreText, { color: c.primary }]}>Daha fazla</Text>
                <MaterialIcons name="expand-more" size={24} color={c.primary} />
              </TouchableOpacity>
            )}
          </>
        )}

        {activeTab === 'notlar' && (
          <>
            <Text style={[styles.sectionTitle, styles.notesSectionTitle, { color: c.text }]}>
              Yanlış yaptığın soruların notları
            </Text>
            <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>
              Yapay zeka notlarını incele. Sonra soruları kategorilerden tekrar çöz.
            </Text>
            {questionsWithNotes.length === 0 ? (
              <View style={[styles.noteEmptyWrap, { backgroundColor: c.card, borderColor: c.border }]}>
                <MaterialIcons name="notes" size={48} color={c.icon} />
                <Text style={[styles.noteEmptyTitle, { color: c.text }]}>Henüz not yok</Text>
                <Text style={[styles.noteEmptyText, { color: c.textSecondary }]}>
                  Sınav veya test bitirdikten sonra yanlış yaptığın sorular için notlar burada görünecek.
                </Text>
              </View>
            ) : (
              <>
                {notesByCategory.slice(0, visibleNotes).map(({ categoryId, categoryName, questions }) => (
                  <TouchableOpacity
                    key={categoryId}
                    style={[styles.categoryCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}
                    onPress={() =>
                      router.push({
                        pathname: '/yanlis-sorular/notlar/[category]',
                        params: { category: categoryId, categoryName },
                      } as never)
                    }
                    activeOpacity={0.7}>
                    <Text style={[styles.categoryName, { color: c.text }]} numberOfLines={1}>
                      {categoryName}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: c.primary }]}>
                      <Text style={[styles.badgeText, { color: c.primaryContrast }]}>{questions.length}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color={c.textSecondary} />
                  </TouchableOpacity>
                ))}
                {notesByCategory.length > visibleNotes && (
                  <TouchableOpacity
                    style={[styles.loadMoreBtn, { borderColor: c.border }]}
                    onPress={() => setVisibleNotes((n) => n + PAGE_SIZE)}
                    activeOpacity={0.7}>
                    <Text style={[styles.loadMoreText, { color: c.primary }]}>Daha fazla</Text>
                    <MaterialIcons name="expand-more" size={24} color={c.primary} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        )}
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
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center' },
  tabLabel: { fontSize: 15, fontWeight: '600' },
  tabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  sectionTitle: { fontSize: 14, marginBottom: Spacing.md },
  notesSectionTitle: { fontSize: 15, fontWeight: '600' },
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
  noteEmptyWrap: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  noteEmptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: Spacing.sm, textAlign: 'center' },
  noteEmptyText: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  loadMoreText: { fontSize: 16, fontWeight: '600' },
});
