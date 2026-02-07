import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, Colors, getCardShadow, Spacing } from '@/constants/theme';
import { showRewardedAd } from '@/lib/ads';
import { useContent } from '@/context/ContentContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCompletedFullExams } from '@/lib/localStorage';

const FULL_EXAM_COUNT = 20;

const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  car: 'directions-car',
  medkit: 'medical-services',
  construct: 'build',
  people: 'people',
  gavel: 'gavel',
  traffic: 'traffic',
  build: 'build',
};

type TabId = 'konu' | 'tam';

export default function SinavScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { categories } = useContent();
  const [activeTab, setActiveTab] = useState<TabId>('konu');
  const [completedFullExams, setCompletedFullExams] = useState<number[]>([]);
  const [examPopupExamNum, setExamPopupExamNum] = useState<number | null>(null);
  const [adLoading, setAdLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getCompletedFullExams().then(setCompletedFullExams);
    }, [])
  );

  const isFullExamUnlocked = (examNum: number) =>
    examNum === 1 || completedFullExams.includes(examNum - 1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
      {/* Konu Testleri / Tam Sınav sekmeleri */}
      <View style={[styles.tabRow, { borderBottomColor: c.border }]}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('konu')}
          activeOpacity={0.7}>
          <Text style={[styles.tabLabel, { color: activeTab === 'konu' ? c.primary : c.textSecondary }]}>
            Konu Testleri
          </Text>
          <View style={[styles.tabUnderline, { backgroundColor: activeTab === 'konu' ? c.primary : 'transparent' }]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('tam')}
          activeOpacity={0.7}>
          <Text style={[styles.tabLabel, { color: activeTab === 'tam' ? c.primary : c.textSecondary }]}>
            Tam Sınav
          </Text>
          <View style={[styles.tabUnderline, { backgroundColor: activeTab === 'tam' ? c.primary : 'transparent' }]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        {activeTab === 'konu' && (
        <>
        <View style={styles.section}>
          <Text style={[styles.sectionSubtitle, { color: c.textSecondary }]}>
            Kategorilere göre 10 soruluk test çözün.
          </Text>
          <View style={styles.topicGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.topicCard,
                  { ...getCardShadow(c), backgroundColor: c.card, borderColor: c.border },
                ]}
                onPress={() => router.push({ pathname: '/quiz', params: { category: cat.id } } as never)}
                activeOpacity={0.7}>
                <View style={[styles.topicIconWrap, { backgroundColor: c.selectedBg }]}>
                  <MaterialIcons name={CATEGORY_ICONS[cat.icon] ?? 'folder'} size={24} color={c.primary} />
                </View>
                <Text style={[styles.topicName, { color: c.text }]} numberOfLines={2}>
                  {cat.name}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={c.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        </>
        )}

        {activeTab === 'tam' && (
        <>
        <View style={styles.section}>
          <Text style={[styles.sectionSubtitle, { color: c.textSecondary }]}>
            Resmi sınav formatında 50 soruluk deneme. Sınav 1’i bitirmeden Sınav 2’ye geçemezsiniz.
          </Text>
        </View>

        <View style={styles.examList}>
          {Array.from({ length: FULL_EXAM_COUNT }, (_, i) => i + 1).map((examNum) => {
            const unlocked = isFullExamUnlocked(examNum);
            const completed = completedFullExams.includes(examNum);
            return (
              <TouchableOpacity
                key={examNum}
                style={[
                  styles.examRow,
                  {
                    ...getCardShadow(c),
                    backgroundColor: unlocked ? c.card : c.selectedBg,
                    borderColor: c.border,
                    opacity: unlocked ? 1 : 0.7,
                  },
                ]}
                onPress={() => {
                  if (!unlocked) return;
                  setExamPopupExamNum(examNum);
                }}
                activeOpacity={0.8}
                disabled={!unlocked}>
                {unlocked ? (
                  <MaterialIcons
                    name={completed ? 'check-circle' : 'play-arrow'}
                    size={24}
                    color={completed ? c.success : c.primary}
                  />
                ) : (
                  <MaterialIcons name="lock" size={24} color={c.textSecondary} />
                )}
                <Text
                  style={[
                    styles.examRowText,
                    {
                      color: unlocked ? (completed ? c.success : c.text) : c.textSecondary,
                    },
                  ]}>
                  Sınav {examNum}
                </Text>
                {unlocked && (
                  <MaterialIcons name="chevron-right" size={22} color={c.textSecondary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        </>
        )}
      </ScrollView>

      {/* Tam sınav tıklanınca: reklam veya Pro üyelik popup */}
      <Modal
        visible={examPopupExamNum !== null}
        transparent
        animationType="fade"
        onRequestClose={() => { setExamPopupExamNum(null); setAdLoading(false); }}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => { setExamPopupExamNum(null); setAdLoading(false); }}>
          <Pressable style={[styles.modalCard, { backgroundColor: c.card, borderColor: c.border }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>Sınava devam etmek için</Text>
              <TouchableOpacity onPress={() => { setExamPopupExamNum(null); setAdLoading(false); }} hitSlop={12} style={styles.modalClose}>
                <MaterialIcons name="close" size={24} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: c.textSecondary }]}>
              Reklam izleyerek ücretsiz devam edebilir veya Pro üyelik ile reklamsız kullanın.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: c.primary }]}
              onPress={() => {
                const num = examPopupExamNum;
                setAdLoading(true);
                showRewardedAd({
                  onRewarded: () => {
                    setExamPopupExamNum(null);
                    if (num) router.push({ pathname: '/sinav-baslangic', params: { fullExam: String(num) } } as never);
                  },
                  onDone: (result) => {
                    setAdLoading(false);
                    if (result === 'error') setExamPopupExamNum(null);
                  },
                });
              }}
              disabled={adLoading}
              activeOpacity={0.8}>
              {adLoading ? (
                <>
                  <ActivityIndicator size="small" color={c.primaryContrast} />
                  <Text style={[styles.modalBtnText, { color: c.primaryContrast }]}>Reklam yükleniyor</Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="play-circle-outline" size={22} color={c.primaryContrast} />
                  <Text style={[styles.modalBtnText, { color: c.primaryContrast }]}>Reklam izle</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnOutline, { borderColor: c.border }]}
              onPress={() => {
                setExamPopupExamNum(null);
                setAdLoading(false);
                router.push('/pro-uyelik' as never);
              }}
              activeOpacity={0.8}>
              <MaterialIcons name="star" size={22} color={c.primary} />
              <Text style={[styles.modalBtnTextOutline, { color: c.text }]}>Pro üyelik</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelWrap}
              onPress={() => { setExamPopupExamNum(null); setAdLoading(false); }}
              activeOpacity={0.7}>
              <Text style={[styles.modalCancel, { color: c.textSecondary }]}>İptal</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.lg,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  topicGrid: {
    gap: Spacing.sm,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  topicIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  topicName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  examList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  examRowText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  modalClose: { padding: 4 },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  modalBtnPrimary: {},
  modalBtnOutline: { backgroundColor: 'transparent', borderWidth: 1 },
  modalBtnText: { fontSize: 16, fontWeight: '600' },
  modalBtnTextOutline: { fontSize: 16, fontWeight: '600' },
  modalCancelWrap: { alignItems: 'center', paddingTop: Spacing.sm },
  modalCancel: { fontSize: 15, fontWeight: '500' },
});
