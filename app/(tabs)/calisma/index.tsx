import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useContent } from '@/context/ContentContext';

const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  car: 'directions-car',
  medkit: 'medical-services',
  construct: 'build',
  people: 'people',
  gavel: 'gavel',
  traffic: 'traffic',
  build: 'build',
};

export default function CalismaIndexScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { categories } = useContent();

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === categories.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(categories.map((c) => c.id)));
    }
  };

  const selectedCount = selected.size;
  const allSelected = selectedCount === categories.length;

  const handleStart = () => {
    const ids = [...selected].join(',');
    router.push({ pathname: '/calisma/[category]', params: { category: ids } } as never);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={[]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}>

        <Text style={[styles.sectionTitle, { color: c.text }]}>Kategori Seç</Text>
        <Text style={[styles.sectionSub, { color: c.textSecondary }]}>
          Seçtiğin kategorilerden 15 soru gelecek
        </Text>

        {/* Tümünü seç */}
        <TouchableOpacity
          style={[styles.selectAllRow, { borderBottomColor: c.border }]}
          onPress={selectAll}
          activeOpacity={0.7}>
          <MaterialIcons
            name={allSelected ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={allSelected ? c.primary : c.textSecondary}
          />
          <Text style={[styles.selectAllText, { color: c.text }]}>Tümünü seç</Text>
        </TouchableOpacity>

        <View style={styles.list}>
          {categories.map((cat) => {
            const isChecked = selected.has(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: c.card,
                    borderColor: isChecked ? c.primary : c.border,
                  },
                ]}
                onPress={() => toggle(cat.id)}
                activeOpacity={0.7}>
                <MaterialIcons
                  name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={isChecked ? c.primary : c.textSecondary}
                />
                <View style={[styles.badge, { backgroundColor: c.primary }]}>
                  <MaterialIcons
                    name={CATEGORY_ICONS[cat.icon] ?? 'folder'}
                    size={18}
                    color={c.primaryContrast}
                  />
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: c.text }]}>{cat.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Buton scroll içinde */}
        <TouchableOpacity
          style={[
            styles.startBtn,
            { backgroundColor: selectedCount > 0 ? c.primary : c.border },
          ]}
          onPress={handleStart}
          disabled={selectedCount === 0}
          activeOpacity={0.8}>
          <Text style={[styles.startBtnText, { color: selectedCount > 0 ? c.primaryContrast : c.textSecondary }]}>
            {selectedCount > 0
              ? `Sınavı Başlat (${selectedCount} kategori)`
              : 'Kategori seç'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  sectionSub: { fontSize: 14, marginBottom: Spacing.lg },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  selectAllText: { fontSize: 15, fontWeight: '600' },
  list: { gap: Spacing.sm, marginBottom: Spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  startBtn: {
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  startBtnText: { fontSize: 17, fontWeight: '700' },
});
