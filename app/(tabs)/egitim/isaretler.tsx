import { ScrollView, StyleSheet, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, getCardShadow, BorderRadius } from '@/constants/theme';
import { trafikIsaretleriKategorileri } from '@/data/trafikIsaretleri';
import { getTabelaImage } from '@/data/tabelaImages';
import { useContent } from '@/context/ContentContext';

export default function IsaretlerScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { categories } = useContent();
  const isaretlerCategory = categories.find((cat) => cat.id === 'isaretler');
  const lessons = isaretlerCategory?.lessons ?? [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: c.text }]}>İşaretler</Text>
          <Text style={[styles.headerSubtitle, { color: c.textSecondary }]}>
            Türkiye'deki trafik işaretleri. Kaynak: Vikipedi.
          </Text>
        </View>

        {lessons.length > 0 && (
          <View style={[styles.summaryCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
            <Text style={[styles.summaryTitle, { color: c.text }]}>Konu özeti</Text>
            {isaretlerCategory?.summary && (
              <Text style={[styles.summaryBox, { color: c.textSecondary }]}>{isaretlerCategory.summary}</Text>
            )}
            {lessons.map((lesson, index) => (
              <View key={lesson.id} style={[styles.lessonRow, index < lessons.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
                <Text style={[styles.lessonTitle, { color: c.text }]}>{lesson.title}</Text>
                <Text style={[styles.lessonSummary, { color: c.primary }]}>{lesson.summary ?? lesson.content}</Text>
              </View>
            ))}
          </View>
        )}

        {trafikIsaretleriKategorileri.map((kategori) => (
          <View key={kategori.id} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.primary }]}>{kategori.title}</Text>
            <View style={[styles.list, { backgroundColor: c.card, borderColor: c.border }]}>
              {kategori.signs.map((isaret, idx) => (
                <View
                  key={`${kategori.id}-${idx}`}
                  style={[styles.row, idx < kategori.signs.length - 1 && styles.rowBorder, { borderColor: c.border }]}>
                  {(() => {
                    const img = getTabelaImage(isaret.code);
                    return img ? (
                      <Image source={img} style={styles.signImage} resizeMode="contain" />
                    ) : (
                      <View style={[styles.signPlaceholder, { backgroundColor: c.border }]} />
                    );
                  })()}
                  <View style={styles.rowText}>
                    <Text style={[styles.code, { color: c.primary }]}>{isaret.code}</Text>
                    <Text style={[styles.name, { color: c.text }]}>{isaret.name}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  header: { paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, lineHeight: 20 },
  summaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  summaryTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  summaryBox: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  lessonRow: { paddingVertical: Spacing.sm },
  lessonTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  lessonSummary: { fontSize: 13, lineHeight: 18 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  list: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  rowBorder: { borderBottomWidth: 1 },
  signImage: {
    width: 56,
    height: 56,
    marginRight: Spacing.md,
    borderRadius: 6,
  },
  signPlaceholder: {
    width: 56,
    height: 56,
    marginRight: Spacing.md,
    borderRadius: 6,
  },
  rowText: { flex: 1 },
  code: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  name: { fontSize: 14 },
});
