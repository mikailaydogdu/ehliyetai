import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius } from '@/constants/theme';
import { mockCategories } from '@/data/mockData';

export default function EgitimBosScreen() {
  const { name, categoryId } = useLocalSearchParams<{ name?: string; categoryId?: string }>();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const category = categoryId ? mockCategories.find((cat) => cat.id === categoryId) : null;
  const lessons = category?.lessons ?? [];
  const sectionName = name ?? category?.name ?? 'Bu bölüm';
  const hasContent = lessons.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: c.text }]}>{sectionName}</Text>
          {!hasContent && (
            <Text style={[styles.headerSubtitle, { color: c.textSecondary }]}>
              Bu bölüm henüz hazırlanıyor. Yakında içerik eklenecektir.
            </Text>
          )}
        </View>

        {hasContent ? (
          <View style={styles.lessonList}>
            {lessons.map((lesson, index) => (
              <View
                key={lesson.id}
                style={[
                  styles.lessonCard,
                  {
                    ...getCardShadow(c),
                    backgroundColor: c.card,
                    borderColor: c.border,
                  },
                ]}>
                <View style={[styles.lessonNumber, { backgroundColor: c.selectedBg }]}>
                  <Text style={[styles.lessonNumberText, { color: c.text }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.lessonTitle, { color: c.text }]}>{lesson.title}</Text>
                <Text style={[styles.lessonContent, { color: c.textSecondary }]}>{lesson.content}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.content}>
            <View style={[styles.iconWrap, { backgroundColor: c.selectedBg }]}>
              <MaterialIcons name="menu-book" size={48} color={c.text} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  header: { paddingTop: Spacing.md, paddingBottom: Spacing.md },
  headerTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, lineHeight: 20 },
  lessonList: { gap: Spacing.md },
  lessonCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  lessonNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  lessonNumberText: { fontSize: 14, fontWeight: '700' },
  lessonTitle: { fontSize: 17, fontWeight: '700', marginBottom: Spacing.sm },
  lessonContent: { fontSize: 15, lineHeight: 22 },
  content: { alignItems: 'center', paddingVertical: Spacing.xl },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
