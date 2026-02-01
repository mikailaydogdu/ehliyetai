import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, getCardShadow, Spacing, BorderRadius } from '@/constants/theme';
import { useExamDate } from '@/context/ExamDateContext';

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export default function SinavTarihimScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { examDate, setExamDate, daysLeft } = useExamDate();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() =>
    examDate ? new Date(examDate) : new Date()
  );

  const subtitleText =
    examDate && daysLeft !== null
      ? daysLeft > 0
        ? `Ana sayfada gösterilecek: Sınava ${daysLeft} gün kaldı`
        : daysLeft === 0
          ? 'Ana sayfada gösterilecek: Sınav bugün!'
          : 'Ana sayfada gösterilecek: Sınav tarihi geçti'
      : 'Ana sayfada "Sınava X gün kaldı" görmek için tarih seçin.';

  const onPickDate = (_: unknown, date?: Date) => {
    if (date) {
      setPickerDate(date);
      if (Platform.OS === 'android') {
        setExamDate(date.toISOString().slice(0, 10));
        setShowPicker(false);
      }
    }
  };

  const openPicker = () => {
    setPickerDate(examDate ? new Date(examDate) : new Date());
    setShowPicker(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Sınav Tarihim</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, getCardShadow(c)]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Ehliyet sınavı tarihi</Text>
          <Text style={[styles.cardSubtitle, { color: c.textSecondary }]}>
            {subtitleText}
          </Text>
          <View style={[styles.row, { borderTopColor: c.border }]}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Tarih</Text>
            <Text style={[styles.value, { color: c.text }]}>
              {examDate ? formatDisplayDate(examDate) : 'Belirtilmedi'}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: c.primary }]}
              onPress={openPicker}
              activeOpacity={0.8}>
              <MaterialIcons name="event" size={20} color={c.primaryContrast} />
              <Text style={[styles.btnText, { color: c.primaryContrast }]}>{examDate ? 'Tarihi değiştir' : 'Tarih seç'}</Text>
            </TouchableOpacity>
            {examDate && (
              <TouchableOpacity
                style={[styles.btn, styles.btnOutline, { borderColor: c.border }]}
                onPress={() => setExamDate(null)}
                activeOpacity={0.8}>
                <Text style={[styles.btnTextOutline, { color: c.textSecondary }]}>Tarihi sil</Text>
              </TouchableOpacity>
            )}
          </View>
          {showPicker && (
            <>
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={onPickDate}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: c.primary, marginTop: Spacing.sm }]}
                  onPress={() => {
                    setExamDate(pickerDate.toISOString().slice(0, 10));
                    setShowPicker(false);
                  }}
                  activeOpacity={0.8}>
                  <Text style={[styles.btnText, { color: c.primaryContrast }]}>Tamam</Text>
                </TouchableOpacity>
              )}
            </>
          )}
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
  content: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.xs },
  cardSubtitle: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    marginTop: Spacing.xs,
  },
  label: { fontSize: 14 },
  value: { fontSize: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
  },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1 },
  btnText: { fontSize: 15, fontWeight: '600' },
  btnTextOutline: { fontSize: 15, fontWeight: '600' },
});
