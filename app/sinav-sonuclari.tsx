import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { BorderRadius, Colors, getCardShadow, Spacing, TOUCH_TARGET_MIN } from '@/constants/theme';
import { useStats } from '@/context/StatsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

export default function SinavSonuclariScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { results } = useStats();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const resultsReversed = [...results].reverse();

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
        <Text style={[styles.headerTitle, { color: c.text }]}>Sınav Sonuçları</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        {results.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialIcons name="quiz" size={56} color={c.textSecondary} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>Henüz sınav sonucu yok</Text>
            <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>
              Sınav veya konu testi çözdüğünüzde sonuçlar burada listelenir.
            </Text>
          </View>
        ) : (
          <>
            {resultsReversed.slice(0, visibleCount).map((r) => {
              const pct = r.totalQuestions > 0 ? Math.round((r.score / r.totalQuestions) * 100) : 0;
              return (
                <View
                  key={r.id}
                  style={[styles.resultCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
                  <View style={styles.resultRow}>
                    <MaterialIcons name="emoji-events" size={24} color={c.primary} />
                    <Text style={[styles.resultLabel, { color: c.textSecondary }]}>
                      {r.examLabel ?? 'Sınav sonucu'}
                    </Text>
                  </View>
                  <Text style={[styles.resultDate, { color: c.textSecondary }]}>{formatDate(r.date)}</Text>
                  <Text style={[styles.resultScore, { color: c.text }]}>
                    {r.score} / {r.totalQuestions} doğru
                  </Text>
                  <Text style={[styles.resultPercent, { color: c.primary }]}>%{pct}</Text>
                </View>
              );
            })}
            {resultsReversed.length > visibleCount && (
              <TouchableOpacity
                style={[styles.loadMoreBtn, { borderColor: c.border }]}
                onPress={() => setVisibleCount((n) => n + PAGE_SIZE)}
                activeOpacity={0.7}>
                <Text style={[styles.loadMoreText, { color: c.primary }]}>Daha fazla</Text>
                <MaterialIcons name="expand-more" size={24} color={c.primary} />
              </TouchableOpacity>
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
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
  emptyWrap: { alignItems: 'center', paddingVertical: Spacing.xl * 2 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  emptySubtitle: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },
  resultCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  resultLabel: { fontSize: 13 },
  resultDate: { fontSize: 12, marginBottom: 4 },
  resultScore: { fontSize: 17, fontWeight: '700' },
  resultPercent: { fontSize: 15, fontWeight: '600', marginTop: 2 },
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
