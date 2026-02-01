import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius } from '@/constants/theme';
import { useWrongQuestions } from '@/context/WrongQuestionsContext';
import type { SavedWrongQuestion } from '@/types';
import { getTabelaImage } from '@/data/tabelaImages';

export default function YanlisSorularScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { wrongQuestions, removeWrongQuestion } = useWrongQuestions();

  const [questionsToReview, setQuestionsToReview] = useState<SavedWrongQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setQuestionsToReview(wrongQuestions);
    setCurrentIndex(0);
    setSelectedIndex(null);
  }, [wrongQuestions.length]);

  const q = questionsToReview[currentIndex];
  const total = questionsToReview.length;
  const hasAnswered = selectedIndex !== null;
  const correct = q && selectedIndex === q.correctIndex;

  const handleSelectOption = (optionIndex: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(optionIndex);
    if (optionIndex === q.correctIndex) {
      removeWrongQuestion(q.questionId);
      setQuestionsToReview((prev) => prev.filter((_, i) => i !== currentIndex));
    }
  };

  const handleNext = () => {
    setSelectedIndex(null);
    if (currentIndex >= questionsToReview.length - 1) {
      if (questionsToReview.length <= 1) {
        Alert.alert('Tamamlandı', 'Tüm soruları çözdün.', [
          { text: 'Tamam', onPress: () => router.back() },
        ]);
        return;
      }
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((i) => i + 1);
  };

  if (wrongQuestions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>Yanlış Yaptığım Sorular</Text>
        </View>
        <View style={styles.emptyWrap}>
          <MaterialIcons name="assignment" size={64} color={c.icon} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>Henüz yanlış soru yok</Text>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            Sınav veya kategori testi çöz; yanlış yaptığın sorular burada birikir ve tekrar
            çözebilirsin.
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

  if (!q) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyTitle, { color: c.text }]}>Tamamlandı</Text>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>
          Soru {currentIndex + 1} / {total}
        </Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.questionBlock, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
          {q.imageCode && getTabelaImage(q.imageCode) && (
            <View style={styles.signImageWrap}>
              <Image
                source={getTabelaImage(q.imageCode)!}
                style={styles.signImage}
                resizeMode="contain"
              />
            </View>
          )}
          <Text style={[styles.questionText, { color: c.text }]}>{q.questionText}</Text>
          <View style={styles.options}>
            {q.options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrect = idx === q.correctIndex;
              const showResult = hasAnswered;
              const bg =
                showResult && isCorrect
                  ? c.success + '20'
                  : isSelected && !correct
                    ? c.error + '20'
                    : c.card;
              const border =
                showResult && isCorrect ? c.success : isSelected && !correct ? c.error : c.border;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                  onPress={() => handleSelectOption(idx)}
                  disabled={hasAnswered}
                  activeOpacity={0.7}>
                  <Text style={[styles.optionText, { color: c.text }]}>
                    {['A', 'B', 'C', 'D'][idx]}) {opt}
                  </Text>
                  {showResult && isCorrect && (
                    <MaterialIcons name="check-circle" size={22} color={c.success} />
                  )}
                  {isSelected && !correct && idx === selectedIndex && (
                    <MaterialIcons name="cancel" size={22} color={c.error} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {hasAnswered && correct && (
          <View style={[styles.feedback, { backgroundColor: c.success + '18', borderColor: c.success }, getCardShadow(c)]}>
            <MaterialIcons name="check-circle" size={24} color={c.success} />
            <Text style={[styles.feedbackText, { color: c.text }]}>Doğru!</Text>
          </View>
        )}

        {hasAnswered && !correct && (
          <View style={[styles.feedback, { backgroundColor: c.error + '18', borderColor: c.error }, getCardShadow(c)]}>
            <MaterialIcons name="info" size={24} color={c.error} />
            <Text style={[styles.feedbackText, { color: c.text }]}>
              Doğru cevap: {q.options[q.correctIndex]}
            </Text>
          </View>
        )}

        {hasAnswered && (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: c.primary }]}
            onPress={handleNext}
            activeOpacity={0.8}>
            <Text style={[styles.nextBtnText, { color: c.primaryContrast }]}>
              {currentIndex >= questionsToReview.length - 1 && questionsToReview.length <= 1
                ? 'Bitir'
                : 'Sonraki'}
            </Text>
          </TouchableOpacity>
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
  backBtn: { padding: 4, marginRight: Spacing.sm },
  headerTitle: { fontSize: 17, fontWeight: '600', flex: 1 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm, textAlign: 'center' },
  emptyText: { textAlign: 'center', lineHeight: 22, marginBottom: Spacing.lg },
  backButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xl },
  questionBlock: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  signImageWrap: { alignItems: 'center', marginBottom: Spacing.sm },
  signImage: { width: 120, height: 120 },
  questionText: { fontSize: 16, fontWeight: '600', lineHeight: 22, marginBottom: Spacing.md },
  options: { gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionText: { fontSize: 15, flex: 1 },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  feedbackText: { fontSize: 16, fontWeight: '600' },
  nextBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtnText: { fontSize: 17, fontWeight: '600' },
});
