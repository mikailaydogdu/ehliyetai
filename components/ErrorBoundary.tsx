import React, { type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) console.error('ErrorBoundary', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Bir hata oluştu</Text>
          <Text style={styles.message}>
            Beklenmeyen bir sorun oluştu. Lütfen uygulamayı yeniden başlatın.
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
            accessibilityLabel="Tekrar dene">
            <Text style={styles.buttonText}>Tekrar dene</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#333' },
  message: { fontSize: 15, textAlign: 'center', marginBottom: 24, color: '#666' },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
