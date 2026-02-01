import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function GirisScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGiris = async () => {
    setError('');
    if (!email.trim()) {
      setError('E-posta girin');
      return;
    }
    if (!password.trim()) {
      setError('Şifre girin');
      return;
    }
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch {
      setError('Giriş yapılamadı');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: c.text }]}>Giriş Yap</Text>
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            B Ehliyet uygulamasına devam etmek için giriş yapın.
          </Text>

          <Text style={[styles.label, { color: c.textSecondary }]}>E-posta</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
            placeholder="ornek@email.com"
            placeholderTextColor={c.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: c.textSecondary }]}>Şifre</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
            placeholder="••••••••"
            placeholderTextColor={c.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={[styles.error, { color: c.error }]}>{error}</Text> : null}

          <Pressable
            style={[styles.button, { backgroundColor: c.primary }]}
            onPress={handleGiris}
            activeOpacity={0.8}>
            <Text style={[styles.buttonText, { color: c.primaryContrast }]}>Giriş Yap</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: c.textSecondary }]}>Hesabınız yok mu? </Text>
            <Pressable onPress={() => router.push('/kayit')} hitSlop={8}>
              <Text style={[styles.link, { color: c.primary }]}>Kayıt ol</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl * 2,
    paddingBottom: Spacing.xl,
  },
  title: { fontSize: 28, fontWeight: '700', marginBottom: Spacing.sm },
  subtitle: { fontSize: 16, marginBottom: Spacing.xl },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  error: { fontSize: 14, marginBottom: Spacing.sm },
  button: {
    paddingVertical: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonText: { fontSize: 17, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: { fontSize: 15 },
  link: { fontSize: 15, fontWeight: '600' },
});
