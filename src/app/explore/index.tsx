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

export default function ProfileScreen() {
  const bottomPadding = useBottomTabPadding();
  const router = useRouter();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!account.trim() || !password) {
      setError('请输入邮箱和密码');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(account.trim(), password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/explore');
  };

  if (isAuthenticated && user) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={[styles.profileSection, { paddingBottom: bottomPadding }]}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('@/assets/images/splash-icon.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <ThemedText type="subtitle" style={styles.profileName}>
              {user.name || '用户'}
            </ThemedText>
            <ThemedText themeColor="textSecondary">{user.email}</ThemedText>

            <Pressable
              style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
              onPress={handleLogout}>
              <ThemedText style={styles.logoutButtonText}>退出登录</ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.contentCenter}>
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="邮箱/手机号"
                  placeholderTextColor="#B0B4BA"
                  value={account}
                  onChangeText={setAccount}
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
                    placeholder="密码"
                    placeholderTextColor="#B0B4BA"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
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
                style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
                onPress={handleLogin}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.loginButtonText}>登录</ThemedText>
                )}
              </Pressable>

              <View style={styles.linkRow}>
                <Pressable hitSlop={8}>
                  <ThemedText themeColor="textSecondary">忘记密码?</ThemedText>
                </Pressable>
                <Link href="/explore/register" asChild>
                  <Pressable hitSlop={8}>
                    <ThemedText style={styles.registerLink}>注册账号</ThemedText>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>

          <View style={[styles.footer, { paddingBottom: bottomPadding }]}>
            <Link href="/explore/user-agreement" asChild>
              <Pressable hitSlop={12} style={styles.agreementPressable}>
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  contentCenter: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    gap: Spacing.four,
  },
  profileSection: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  profileName: {
    marginTop: Spacing.three,
  },
  logoWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  formSection: {
    gap: Spacing.four,
  },
  inputGroup: {
    gap: Spacing.two,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: Spacing.two,
    color: '#1C2024',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    padding: Spacing.one,
  },
  eyeText: {
    fontSize: 14,
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E8EC',
  },
  actionSection: {
    gap: Spacing.four,
  },
  loginButton: {
    backgroundColor: BRAND_BLUE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButton: {
    marginTop: Spacing.five,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: Spacing.six,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonText: {
    color: '#B91C1C',
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  registerLink: {
    color: BRAND_BLUE,
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.four,
  },
  agreementPressable: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  agreementLink: {
    color: BRAND_BLUE,
    fontSize: 14,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
  errorText: {
    color: '#B91C1C',
  },
});
