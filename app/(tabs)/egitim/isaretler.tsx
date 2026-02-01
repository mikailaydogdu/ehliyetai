import { ScrollView, StyleSheet, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/constants/theme';
import { trafikIsaretleriKategorileri } from '@/data/trafikIsaretleri';
import { getTabelaImage } from '@/data/tabelaImages';

export default function IsaretlerScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
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
