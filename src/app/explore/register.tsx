import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBottomTabPadding } from '@/hooks/use-bottom-tab-padding';

const BRAND_BLUE = '#208AEF';

export default function RegisterScreen() {
  const bottomPadding = useBottomTabPadding();
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      setError('请输入邮箱和密码');
      return;
    }

    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register(email.trim(), password, name.trim() || undefined);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.logoSection}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('@/assets/images/splash-icon.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <ThemedText type="subtitle" style={styles.title}>
              注册账号
            </ThemedText>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="昵称（可选）"
                placeholderTextColor="#B0B4BA"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
              <View style={styles.inputDivider} />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="邮箱"
                placeholderTextColor="#B0B4BA"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
              />
              <View style={styles.inputDivider} />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="密码（至少 6 位）"
                  placeholderTextColor="#B0B4BA"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={8}
                  style={styles.eyeButton}>
                  <ThemedText themeColor="textSecondary" style={styles.eyeText}>
                    {showPassword ? '隐藏' : '显示'}
                  </ThemedText>
                </Pressable>
              </View>
              <View style={styles.inputDivider} />
            </View>
          </View>

          {error && (
            <ThemedView style={styles.errorBanner}>
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
            </ThemedView>
          )}

          <View style={styles.actionSection}>
            <Pressable
              style={({ pressed }) => [styles.registerButton, pressed && styles.pressed]}
              onPress={handleRegister}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.registerButtonText}>注册并登录</ThemedText>
              )}
            </Pressable>

            <Link href="/explore" asChild>
              <Pressable hitSlop={8} style={styles.loginLinkWrap}>
                <ThemedText style={styles.loginLink}>已有账号？去登录</ThemedText>
              </Pressable>
            </Link>
          </View>

          <View style={[styles.footer, { paddingBottom: bottomPadding }]}>
            <Link href="/explore/user-agreement" asChild>
              <Pressable hitSlop={12}>
                <ThemedText style={styles.agreementLink}>用户协议</ThemedText>
              </Pressable>
            </Link>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1, paddingHorizontal: Spacing.four },
  logoSection: {
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
  },
  logoWrapper: { alignItems: 'center' },
  logo: { width: 64, height: 64, borderRadius: 16 },
  title: { textAlign: 'center' },
  formSection: { gap: Spacing.four, paddingVertical: Spacing.two },
  inputGroup: { gap: Spacing.two },
  input: {
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: Spacing.two,
    color: '#1C2024',
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1 },
  eyeButton: { padding: Spacing.one },
  eyeText: { fontSize: 14 },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E8EC',
  },
  actionSection: { paddingTop: Spacing.four, gap: Spacing.four },
  registerButton: {
    backgroundColor: BRAND_BLUE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: { opacity: 0.85 },
  loginLinkWrap: { alignItems: 'center' },
  loginLink: { color: BRAND_BLUE, fontSize: 14 },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: Spacing.four,
  },
  agreementLink: { color: BRAND_BLUE, fontSize: 14 },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
  errorText: { color: '#B91C1C' },
});
