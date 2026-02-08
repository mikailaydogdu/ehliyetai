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
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  /** 3+ kategori seçilip Testi Başlat’a basıldığında reklam popup için saklanan kategori listesi */
  const [konuTestAdPopupCategories, setKonuTestAdPopupCategories] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllCategories = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categories.map((c) => c.id)));
    }
  };

  const selectedCategoryCount = selectedCategories.size;
  const allCategoriesSelected = selectedCategoryCount === categories.length;

  const handleKonuTestStart = () => {
    const ids = [...selectedCategories].join(',');
    if (selectedCategoryCount > 3) {
      setKonuTestAdPopupCategories(ids);
      return;
    }
    router.push({ pathname: '/calisma/[category]', params: { category: ids } } as never);
  };

  const closeKonuTestAdPopup = () => {
    setKonuTestAdPopupCategories(null);
    setAdLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      getCompletedFullExams().then(setCompletedFullExams);
    }, [])
  );

  const isFullExamUnlocked = (examNum: number) =>
    examNum === 1 || completedFullExams.includes(examNum - 1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
      {/* Konu Testleri / E-Sınav sekmeleri */}
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
            E-Sınav
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
          <Text style={[styles.sectionTitle, { color: c.text }]}>Kategori Seç</Text>
          <Text style={[styles.sectionSubtitle, { color: c.textSecondary }]}>
            Seçtiğin kategorilerden 15 soru gelecek
          </Text>

          <TouchableOpacity
            style={[styles.selectAllRow, { borderBottomColor: c.border }]}
            onPress={selectAllCategories}
            activeOpacity={0.7}>
            <MaterialIcons
              name={allCategoriesSelected ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={allCategoriesSelected ? c.primary : c.textSecondary}
            />
            <Text style={[styles.selectAllText, { color: c.text }]}>Tümünü seç</Text>
          </TouchableOpacity>

          <View style={styles.topicList}>
            {categories.map((cat) => {
              const isChecked = selectedCategories.has(cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.topicCard,
                    { ...getCardShadow(c), backgroundColor: c.card, borderColor: isChecked ? c.primary : c.border },
                  ]}
                  onPress={() => toggleCategory(cat.id)}
                  activeOpacity={0.7}>
                  <MaterialIcons
                    name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={isChecked ? c.primary : c.textSecondary}
                  />
                  <View style={[styles.topicIconWrap, { backgroundColor: c.primary }]}>
                    <MaterialIcons name={CATEGORY_ICONS[cat.icon] ?? 'folder'} size={18} color={c.primaryContrast} />
                  </View>
                  <Text style={[styles.topicName, { color: c.text }]} numberOfLines={2}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.konuStartBtn,
              { backgroundColor: selectedCategoryCount > 0 ? c.primary : c.border },
            ]}
            onPress={handleKonuTestStart}
            disabled={selectedCategoryCount === 0}
            activeOpacity={0.8}>
            <Text style={[styles.konuStartBtnText, { color: selectedCategoryCount > 0 ? c.primaryContrast : c.textSecondary }]}>
              {selectedCategoryCount > 0
                ? `Testi Başlat (${selectedCategoryCount} kategori)`
                : 'Kategori seç'}
            </Text>
          </TouchableOpacity>
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

      {/* E-Sınav tıklanınca: reklam veya Pro üyelik popup */}
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

      {/* Konu testi: 3’ten fazla kategori seçilince reklam popup */}
      <Modal
        visible={konuTestAdPopupCategories !== null}
        transparent
        animationType="fade"
        onRequestClose={closeKonuTestAdPopup}>
        <Pressable style={styles.modalOverlay} onPress={closeKonuTestAdPopup}>
          <Pressable style={[styles.modalCard, { backgroundColor: c.card, borderColor: c.border }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>3’ten fazla kategori seçtiniz</Text>
              <TouchableOpacity onPress={closeKonuTestAdPopup} hitSlop={12} style={styles.modalClose}>
                <MaterialIcons name="close" size={24} color={c.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: c.textSecondary }]}>
              Konu testine devam etmek için reklam izleyebilir veya Pro üyelik ile reklamsız kullanabilirsiniz.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: c.primary }]}
              onPress={() => {
                const categoryIds = konuTestAdPopupCategories;
                setAdLoading(true);
                showRewardedAd({
                  onRewarded: () => {
                    closeKonuTestAdPopup();
                    if (categoryIds) {
                      router.push({ pathname: '/calisma/[category]', params: { category: categoryIds } } as never);
                    }
                  },
                  onDone: (result) => {
                    setAdLoading(false);
                    if (result === 'error') closeKonuTestAdPopup();
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
                closeKonuTestAdPopup();
                router.push('/pro-uyelik' as never);
              }}
              activeOpacity={0.8}>
              <MaterialIcons name="star" size={22} color={c.primary} />
              <Text style={[styles.modalBtnTextOutline, { color: c.text }]}>Pro üyelik</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelWrap}
              onPress={closeKonuTestAdPopup}
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
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  selectAllText: { fontSize: 15, fontWeight: '600' },
  topicList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  topicIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  konuStartBtn: {
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  konuStartBtnText: { fontSize: 17, fontWeight: '700' },
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
