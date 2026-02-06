import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing } from '@/constants/theme';
import { useNetwork } from '@/context/NetworkContext';

export default function OfflineScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { isConnected } = useNetwork();

  useEffect(() => {
    if (isConnected === true) {
      router.replace('/(tabs)');
    }
  }, [isConnected]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: c.error + '20' }]}>
          <MaterialIcons name="cloud-off" size={80} color={c.error} />
        </View>
        <Text style={[styles.title, { color: c.text }]}>İnternet bağlantısı yok</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
