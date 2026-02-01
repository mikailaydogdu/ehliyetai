import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius } from '@/constants/theme';

export default function YardimScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.text }]}>Yardım</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Sıkça Sorulan Sorular</Text>
          <Text style={[styles.paragraph, { color: c.textSecondary }]}>
            B Ehliyet uygulamasında kategorilere göre test çözebilir veya tam sınav simülasyonu yapabilirsin. Yanlış
            yaptığın sorular otomatik kaydedilir ve "Yanlış Yaptığım Sorular" bölümünden tekrar çözebilirsin.
          </Text>
          <Text style={[styles.paragraph, { color: c.textSecondary }]}>
            Sınav sekmesinden 50 soruluk resmi sınav formatında deneme çözebilirsin. Chat sekmesi en az 3 sınav
            tamamladıktan sonra AI ile ek soru üretmek için açılır.
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>İletişim</Text>
          <Text style={[styles.paragraph, { color: c.textSecondary }]}>
            Sorularınız için: destek@behliyet.com
          </Text>
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
    marginBottom: Spacing.md,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  paragraph: { fontSize: 15, lineHeight: 22, marginBottom: Spacing.sm },
});
