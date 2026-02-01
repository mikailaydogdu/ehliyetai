import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius } from '@/constants/theme';
import { useStats } from '@/context/StatsContext';
import { mockCategories } from '@/data/mockData';

const MIN_EXAMS_TO_UNLOCK = 3;

export default function CalismaIndexScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { results } = useStats();

  const examCount = results.length;
  const chatUnlocked = examCount >= MIN_EXAMS_TO_UNLOCK;

  const wrongByCategory: Record<string, number> = {};
  results.forEach((r) => {
    r.wrongAnswers.forEach((w) => {
      wrongByCategory[w.categoryName] = (wrongByCategory[w.categoryName] ?? 0) + 1;
    });
  });

  const sortedCategories = mockCategories
    .map((cat) => ({ ...cat, wrongCount: wrongByCategory[cat.name] ?? 0 }))
    .filter((cat) => cat.wrongCount > 0)
    .sort((a, b) => b.wrongCount - a.wrongCount);

  const onCategoryPress = (categoryId: string, categoryName: string) => {
    if (!chatUnlocked) return;
    router.push({ pathname: '/calisma/[category]', params: { category: categoryId, categoryName } } as never);
  };

  const karisikActive = chatUnlocked && sortedCategories.length >= 3;

  const goToExam = () => {
    router.push('/(tabs)/sinav' as never);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + 56 + insets.bottom }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {!chatUnlocked ? (
            <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
              <MaterialIcons name="lock" size={48} color={c.icon} />
              <Text style={[styles.emptyTitle, { color: c.text }]}>Kilitli</Text>
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                En az {MIN_EXAMS_TO_UNLOCK} sınav bitirerek AI sorularına erişebilirsin. ({examCount}/{MIN_EXAMS_TO_UNLOCK}) Aşağıdaki butondan sınava girebilirsin.
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.card,
                  { backgroundColor: c.card, borderColor: c.border, opacity: karisikActive ? 1 : 0.6 },
                  getCardShadow(c),
                ]}
                onPress={() => karisikActive && onCategoryPress('karisik', 'Karışık (tüm kategoriler)')}
                activeOpacity={karisikActive ? 0.7 : 1}
                disabled={!karisikActive}>
                <View style={[styles.badge, { backgroundColor: karisikActive ? c.primary : c.border }]}>
                  <MaterialIcons name="shuffle" size={20} color={karisikActive ? c.primaryContrast : c.text} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: c.text }]}>Karışık</Text>
                  <Text style={[styles.cardHint, { color: c.textSecondary }]}>
                    {karisikActive
                      ? 'Tüm kategorilerden karışık AI soruları'
                      : 'En az 3 kategori gerekli'}
                  </Text>
                </View>
                {karisikActive && (
                  <MaterialIcons name="chevron-right" size={24} color={c.textSecondary} />
                )}
              </TouchableOpacity>

              {sortedCategories.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
                  <MaterialIcons name="quiz" size={48} color={c.icon} />
                  <Text style={[styles.emptyTitle, { color: c.text }]}>Henüz veri yok</Text>
                  <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                    Sınav sekmesinden test çöz; yanlış yaptığın kategoriler burada listelenir.
                  </Text>
                </View>
              ) : (
                sortedCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}
                    onPress={() => onCategoryPress(cat.id, cat.name)}
                    activeOpacity={0.7}>
                    <View style={[styles.badge, { backgroundColor: c.error }]}>
                      <Text style={[styles.badgeText, { color: c.primaryContrast }]}>{cat.wrongCount}</Text>
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={[styles.cardTitle, { color: c.text }]}>{cat.name}</Text>
                      <Text style={[styles.cardHint, { color: c.textSecondary }]}>
                        {cat.wrongCount} yanlış
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color={c.textSecondary} />
                  </TouchableOpacity>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: c.background }]}>
<TouchableOpacity
        style={[styles.examButton, { backgroundColor: c.primary }]}
        onPress={goToExam}
        activeOpacity={0.8}>
        <MaterialIcons name="quiz" size={22} color={c.primaryContrast} />
        <Text style={[styles.examButtonText, { color: c.primaryContrast }]}>Sınav Çöz</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  emptyCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  emptyText: { textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 },
  list: { gap: Spacing.sm },
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
  badgeText: { fontSize: 14, fontWeight: '700' },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardHint: { fontSize: 12, marginTop: 2 },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  examButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  examButtonText: { fontSize: 16, fontWeight: '700' },
});
