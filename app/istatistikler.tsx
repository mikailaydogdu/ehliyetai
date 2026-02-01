import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius } from '@/constants/theme';
import { useStats } from '@/context/StatsContext';

export default function IstatistiklerScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { results } = useStats();

  const wrongByCategory: Record<string, number> = {};
  let totalWrong = 0;
  results.forEach((r) => {
    r.wrongAnswers.forEach((w) => {
      wrongByCategory[w.categoryName] = (wrongByCategory[w.categoryName] ?? 0) + 1;
      totalWrong += 1;
    });
  });

  const categoryStats = Object.entries(wrongByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      percent: totalWrong > 0 ? Math.round((count / totalWrong) * 100) : 0,
    }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.text }]}>İstatistikler</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Yanlış Kategoriler</Text>
          <Text style={[styles.cardSubtitle, { color: c.textSecondary }]}>
            Hangi kategorilerde en çok yanlış yaptığını görüyorsun.
          </Text>
          {categoryStats.length > 0 ? (
            <>
              <View style={[styles.totalRow, { borderBottomColor: c.border }]}>
                <Text style={[styles.totalLabel, { color: c.textSecondary }]}>Toplam yanlış cevap</Text>
                <Text style={[styles.totalValue, { color: c.error }]}>{totalWrong}</Text>
              </View>
              {categoryStats.map(({ name, count, percent }) => (
                <View key={name} style={[styles.categoryRow, { borderBottomColor: c.border }]}>
                  <Text style={[styles.categoryName, { color: c.text }]} numberOfLines={1}>{name}</Text>
                  <View style={styles.categoryRight}>
                    <Text style={[styles.categoryCount, { color: c.error }]} numberOfLines={1}>{count} yanlış</Text>
                    <Text style={[styles.categoryPercent, { color: c.textSecondary }]} numberOfLines={1}>%{percent}</Text>
                  </View>
                </View>
              ))}
              <View style={[styles.chartSection, { borderTopColor: c.border }]}>
                <Text style={[styles.chartTitle, { color: c.text }]}>Dağılım (yüzde)</Text>
                <View style={styles.chartBars}>
                  {categoryStats.map(({ name, count, percent }) => {
                    const barWidthPercent = totalWrong > 0 ? (count / totalWrong) * 100 : 0;
                    return (
                      <View key={name} style={styles.chartRow}>
                        <Text style={[styles.chartLabel, { color: c.text }]} numberOfLines={1}>{name}</Text>
                        <View style={[styles.chartBarBg, { backgroundColor: c.border }]}>
                          <View
                            style={[
                              styles.chartBarFill,
                              { width: `${barWidthPercent}%`, backgroundColor: c.error },
                            ]}
                          />
                        </View>
                        <Text style={[styles.chartValue, { color: c.text }]} numberOfLines={1}>%{percent}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="pie-chart" size={48} color={c.icon} />
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                Henüz sınav çözmedin veya tüm cevapların doğru.
              </Text>
            </View>
          )}
        </View>
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
  backBtn: { padding: 4, marginRight: Spacing.sm },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.xs },
  cardSubtitle: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    marginBottom: Spacing.xs,
  },
  totalLabel: { fontSize: 14 },
  totalValue: { fontSize: 18, fontWeight: '700' },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  categoryName: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: Spacing.sm },
  categoryRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  categoryCount: { fontSize: 14, fontWeight: '600' },
  categoryPercent: { fontSize: 13, fontWeight: '600', minWidth: 32 },
  chartSection: { marginTop: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1 },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.md },
  chartBars: { gap: Spacing.sm },
  chartRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  chartLabel: { fontSize: 13, width: 100 },
  chartBarBg: { flex: 1, height: 20, borderRadius: 10, overflow: 'hidden' },
  chartBarFill: { height: '100%', borderRadius: 10 },
  chartValue: { fontSize: 13, fontWeight: '600', minWidth: 36, textAlign: 'right' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { textAlign: 'center', marginTop: Spacing.md, lineHeight: 22 },
});
