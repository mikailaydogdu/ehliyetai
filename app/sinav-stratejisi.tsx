import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, Colors, getCardShadow, Spacing, TOUCH_TARGET_MIN } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Sabit sınav stratejisi notları – kart başlığı ve içerik */
const STRATEJI_NOTLARI: { id: string; icon: keyof typeof MaterialIcons.glyphMap; title: string; note: string }[] = [
  {
    id: 'sure',
    icon: 'schedule',
    title: 'Süre yönetimi',
    note: '50 soru için 45 dakikan var. Soru başına ortalama 1 dakikadan az. Takıldığın soruda 1–2 dakikadan fazla bekleme; işaretleyip geç, sona bırak.',
  },
  {
    id: 'sira',
    icon: 'reorder',
    title: 'Hangi soruyu sona bırakmalı',
    note: 'Zor soruda takılırsan geç, işaretle ve sona bırak. Önce emin olduğun soruları çöz; süre kalırsa zor olanlara dön.',
  },
  {
    id: 'heyecan',
    icon: 'psychology',
    title: 'Heyecan kontrolü',
    note: 'Başlamadan önce birkaç derin nefes al. Soruyu iki kez oku. Şıkları elemek için "kesin yanlış" olanları çiz; kalanlar arasından seç.',
  },
  {
    id: 'isaretle',
    icon: 'bookmark-border',
    title: 'İşaretle ve dön',
    note: 'Emin olmadığın soruları atlama; işaretleyip sona bırak. Süre kalırsa tekrar bak. Boş bırakmak yerine son dakikada tahmin etmek daha iyidir.',
  },
  {
    id: 'tekrar-oku',
    icon: 'visibility',
    title: 'Soruyu tekrar oku',
    note: '"Hangisi yanlıştır?" ve "Hangisi doğrudur?" birbirine karıştırılır. Soru kökünü dikkatli oku; olumsuz ifadelere (değildir, yapılmaz vb.) dikkat et.',
  },
  {
    id: 'tahmin',
    icon: 'help-outline',
    title: 'Bilmiyorsan tahmin',
    note: 'Boş bırakma; yanlış cevap puan düşürmez. İki şıkka indirdiysen birini seç. Hiç fikrin yoksa tutarlı bir strateji kullan.',
  },
];

export default function SinavStratejisiScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Geri"
          accessibilityHint="Önceki sayfaya dön">
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.text }]}>Sınav Stratejisi</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Psikolojik destek ve sınav taktikleri: süre yönetimi, soru sırası, heyecan kontrolü
        </Text>

        {STRATEJI_NOTLARI.map((item) => (
          <View
            key={item.id}
            style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
            <View style={[styles.cardIconWrap, { backgroundColor: c.selectedBg }]}>
              <MaterialIcons name={item.icon} size={24} color={c.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: c.text }]}>{item.title}</Text>
              <Text style={[styles.cardNote, { color: c.textSecondary }]}>{item.note}</Text>
            </View>
          </View>
        ))}
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
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  cardNote: { fontSize: 14, lineHeight: 22 },
});
