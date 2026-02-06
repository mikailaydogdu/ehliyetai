import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius, TOUCH_TARGET_MIN } from '@/constants/theme';
import { useLastQuizWrong } from '@/context/LastQuizWrongContext';
import { getQuestionImageSource } from '@/data/tabelaImages';

export default function QuizYanlisSorularScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { wrongAnswers } = useLastQuizWrong();

  const list = wrongAnswers ?? [];

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
        <Text style={[styles.headerTitle, { color: c.text }]}>Yanlış Sorular</Text>
      </View>

      {list.length === 0 ? (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="check-circle" size={64} color={c.success} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>Yanlış soru yok</Text>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            Bu sınavda tüm soruları doğru yanıtladınız.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: c.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.8}>
            <Text style={[styles.primaryBtnText, { color: c.primaryContrast }]}>Geri dön</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.xl }]}
          showsVerticalScrollIndicator={false}>
          {list.map((w, idx) => (
            <View
              key={`${w.questionId}-${idx}`}
              style={[styles.wrongCard, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
              {w.imageCode && getQuestionImageSource(w.imageCode) && (
                <View style={styles.signWrap}>
                  <Image
                    source={getQuestionImageSource(w.imageCode)!}
                    style={styles.signImage}
                    resizeMode="contain"
                  />
                </View>
              )}
              <Text style={[styles.wrongQuestionText, { color: c.text }]}>{w.questionText}</Text>
            </View>
          ))}
        </ScrollView>
      )}
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
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  emptyText: { textAlign: 'center', marginBottom: Spacing.lg },
  primaryBtn: { paddingVertical: 14, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.md },
  primaryBtnText: { fontSize: 17, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  wrongCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  signWrap: { alignItems: 'center', marginBottom: Spacing.sm },
  signImage: { width: 100, height: 100 },
  wrongQuestionText: { fontSize: 15, lineHeight: 22 },
});
