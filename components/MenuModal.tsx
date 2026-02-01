import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/constants/theme';
import { useMenu } from '@/context/MenuContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const DRAWER_WIDTH_PERCENT = 0.8;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * DRAWER_WIDTH_PERCENT;

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
};

export default function MenuModal() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { isOpen, close } = useMenu();
  const { user, logout } = useAuth();
  const { themePreference, setThemePreference } = useTheme();
  const isDark = colorScheme === 'dark';
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateX.setValue(-DRAWER_WIDTH);
      backdropOpacity.setValue(0);
    }
  }, [isOpen, translateX, backdropOpacity]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => close());
  };

  const navigate = (path: string) => {
    handleClose();
    setTimeout(() => router.push(path as never), 250);
  };

  const menuItems: MenuItem[] = [
    { id: 'yanlis', label: 'Yanlış Yaptığım Sorular', icon: 'assignment', onPress: () => navigate('/yanlis-sorular') },
    { id: 'tarih', label: 'Sınav Tarihim', icon: 'event', onPress: () => navigate('/sinav-tarihim') },
  ];

  const toggleDarkMode = (value: boolean) => {
    setThemePreference(value ? 'dark' : 'light');
  };

  const handleCikis = async () => {
    handleClose();
    await logout();
    const { router } = await import('expo-router');
    setTimeout(() => router.replace('/giris'), 250);
  };

  return (
    <Modal visible={isOpen} transparent animationType="none" statusBarTranslucent>
      <View style={[styles.fullScreen, { zIndex: 9999, elevation: 9999 }]}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>
        <Animated.View style={[styles.drawerWrap, { transform: [{ translateX }] }]}>
          <SafeAreaView style={[styles.drawer, { backgroundColor: c.background }]} edges={['top', 'left', 'bottom']}>
            <View style={[styles.drawerHeader, { borderBottomColor: c.border }]}>
              <Text style={[styles.drawerTitle, { color: c.text }]}>Menü</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
              <MaterialIcons name="close" size={24} color={c.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.item, { backgroundColor: pressed ? c.selectedBg : 'transparent' }]}
                onPress={item.onPress}>
                <MaterialIcons name={item.icon} size={22} color={c.primary} />
                <Text style={[styles.itemLabel, { color: c.text }]}>{item.label}</Text>
                <MaterialIcons name="chevron-right" size={20} color={c.textSecondary} />
              </Pressable>
            ))}
            <View style={styles.darkModeRow}>
              <MaterialIcons name="nights-stay" size={22} color={c.primary} />
              <Text style={[styles.darkModeLabel, { color: c.text }]}>Karanlık mod</Text>
              <Switch
                value={isDark}
                onValueChange={toggleDarkMode}
                trackColor={{ false: c.border, true: c.primary + '80' }}
                thumbColor={isDark ? c.primary : c.card}
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: c.border }]}>
            <Text style={[styles.userName, { color: c.text }]} numberOfLines={1}>
              {user?.name ?? 'İsim Soyisim'}
            </Text>
            <Pressable
              style={[styles.cikisBtn, { borderColor: c.border }]}
              onPress={handleCikis}
              hitSlop={8}>
              <MaterialIcons name="logout" size={20} color={c.error} />
              <Text style={[styles.cikisText, { color: c.error }]}>Çıkış</Text>
            </Pressable>
          </View>
        </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    minHeight: '100%',
  },
  drawerWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 10,
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    minHeight: '100%',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  drawerTitle: { fontSize: 20, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: Spacing.sm, paddingBottom: Spacing.xl },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  itemLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  darkModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  darkModeLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  userName: { flex: 1, fontSize: 16, fontWeight: '600', marginRight: Spacing.sm },
  cikisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  cikisText: { fontSize: 15, fontWeight: '600' },
});
