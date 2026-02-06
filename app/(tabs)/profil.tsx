import React from 'react';
import { router } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, View, Text, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useExamDate } from '@/context/ExamDateContext';
import { useWrongQuestions } from '@/context/WrongQuestionsContext';
import { useStats } from '@/context/StatsContext';
import { clearAllProfileData } from '@/lib/localStorage';

const APP_LOGO = require('@/assets/images/ehliyetai.png');
const APP_NAME = 'EhliyetAI';

type GridItem = {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  path: string;
};

const GRID_ITEMS: GridItem[] = [
  { id: 'istatistikler', label: 'İstatistikler', icon: 'bar-chart', path: '/istatistikler' },
  { id: 'yardim', label: 'Yardım', icon: 'help-outline', path: '/yardim' },
  { id: 'yanlis', label: 'Yanlış Yaptığım Sorular', icon: 'assignment', path: '/yanlis-sorular' },
  { id: 'hakkinda', label: 'Uygulama Hakkında', icon: 'info', path: '/uygulama-hakkinda' },
];

export default function ProfilScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { user, reloadFromStorage: reloadAuth } = useAuth();
  const { themePreference, setThemePreference } = useTheme();
  const { reloadFromStorage: reloadExamDate } = useExamDate();
  const { reloadFromStorage: reloadWrongQuestions } = useWrongQuestions();
  const { reloadFromStorage: reloadStats } = useStats();
  const isDark = colorScheme === 'dark';

  const onMenuPress = (item: GridItem) => {
    if (item.path) router.push(item.path as never);
  };

  const toggleDarkMode = (value: boolean) => {
    setThemePreference(value ? 'dark' : 'light');
  };

  const handleProfilVerileriSil = () => {
    Alert.alert(
      'Profil verilerini sil',
      'Ad, sınav tarihi, yanlış sorular ve sınav sonuçları silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await clearAllProfileData();
            await Promise.all([reloadAuth(), reloadExamDate(), reloadWrongQuestions(), reloadStats()]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.appBlock}>
          <Image source={APP_LOGO} style={styles.appLogo} resizeMode="contain" />
          <Text style={[styles.appName, { color: c.text }]}>{APP_NAME}</Text>
          <Pressable
            style={({ pressed }) => [styles.profilEditRow, pressed && { opacity: 0.8 }]}
            onPress={() => router.push('/profil-guncelleme' as never)}>
            <Text style={[styles.profilEditLabel, { color: c.textSecondary }]}>
              {user?.name ?? 'Kullanıcı'}
            </Text>
            <MaterialIcons name="edit" size={18} color={c.textSecondary} />
          </Pressable>
        </View>

        <View style={[styles.darkModeRow, { borderColor: c.border, backgroundColor: c.card }, getCardShadow(c)]}>
          <MaterialIcons name="nights-stay" size={24} color={c.primary} />
          <Text style={[styles.darkModeLabel, { color: c.text }]}>Karanlık mod</Text>
          <Switch
            value={isDark}
            onValueChange={toggleDarkMode}
            trackColor={{ false: c.border, true: c.primary + '80' }}
            thumbColor={isDark ? c.primary : c.card}
            accessibilityLabel="Karanlık mod"
            accessibilityHint={isDark ? 'Açık moda geçmek için dokunun' : 'Karanlık moda geçmek için dokunun'}
          />
        </View>

        <View style={styles.menuList}>
          {GRID_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.menuRow,
                {
                  borderColor: c.border,
                  backgroundColor: pressed ? c.selectedBg : c.card,
                },
                getCardShadow(c),
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => onMenuPress(item)}>
              <MaterialIcons name={item.icon} size={24} color={c.primary} />
              <Text style={[styles.menuLabel, { color: c.text }]}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={22} color={c.textSecondary} />
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.clearRow,
            { borderColor: c.border, backgroundColor: c.card },
            getCardShadow(c),
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleProfilVerileriSil}>
          <MaterialIcons name="delete-outline" size={24} color={c.error} />
          <Text style={[styles.clearLabel, { color: c.error }]}>Profil verileri sil</Text>
          <MaterialIcons name="chevron-right" size={22} color={c.textSecondary} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  appBlock: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  appLogo: {
    width: 96,
    height: 96,
    marginBottom: Spacing.sm,
  },
  appName: { fontSize: 24, fontWeight: '700', marginBottom: Spacing.sm },
  profilEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profilEditLabel: { fontSize: 15 },
  menuList: { gap: Spacing.sm, marginBottom: Spacing.md },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  darkModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  darkModeLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  clearLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
});
