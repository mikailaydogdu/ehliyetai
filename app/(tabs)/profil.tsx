import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View, Text, Pressable, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

type GridItem = {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  path: string;
  danger?: boolean;
};

const GRID_ITEMS: GridItem[] = [
  { id: 'sifre', label: 'Şifre Değiştir', icon: 'lock', path: '/sifre-degistir' },
  { id: 'istatistikler', label: 'İstatistikler', icon: 'bar-chart', path: '/istatistikler' },
  { id: 'yardim', label: 'Yardım', icon: 'help-outline', path: '/yardim' },
  { id: 'sil', label: 'Hesap Sil', icon: 'delete-outline', path: '', danger: true },
];

export default function ProfilScreen() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { user, deleteAccount } = useAuth();
  const gap = Spacing.md;
  const cardSize = (width - Spacing.lg * 2 - gap) / 2;

  const handleHesapSil = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınız silinecek ve çıkış yapacaksınız. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount();
            router.replace('/giris');
          },
        },
      ]
    );
  };

  const onGridPress = (item: GridItem) => {
    if (item.danger) handleHesapSil();
    else if (item.path) router.push(item.path as never);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {user && (
          <Pressable
            style={({ pressed }) => [
              styles.userBlock,
              { backgroundColor: c.background },
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => router.push('/profil-guncelleme' as never)}>
            <View style={[styles.userAvatar, { backgroundColor: c.selectedBg }]}>
              <Text style={[styles.userAvatarText, { color: c.text }]}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.userName, { color: c.text }]} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={[styles.userEmail, { color: c.textSecondary }]} numberOfLines={1}>
              {user.email}
            </Text>
          </Pressable>
        )}

        <View style={[styles.grid, { gap }]}>
          {GRID_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.gridCard,
                {
                  ...getCardShadow(c),
                  width: cardSize,
                  borderColor: c.border,
                  borderRadius: BorderRadius.xl,
                  borderWidth: 1,
                  backgroundColor: pressed ? c.selectedBg : c.card,
                },
              ]}
              onPress={() => onGridPress(item)}>
              <MaterialIcons
                name={item.icon}
                size={28}
                color={item.danger ? c.error : c.text}
                style={styles.gridIcon}
              />
              <Text
                style={[
                  styles.gridLabel,
                  { color: item.danger ? c.error : c.text },
                ]}
                numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  userBlock: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  userAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  userAvatarText: { fontSize: 32, fontWeight: '700' },
  userName: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: 15 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    minHeight: 110,
  },
  gridIcon: { marginBottom: Spacing.sm },
  gridLabel: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
