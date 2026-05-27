import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
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
import { useBottomTabPadding } from '@/hooks/use-bottom-tab-padding';

const BRAND_BLUE = '#208AEF';

export default function LoginScreen() {
  const bottomPadding = useBottomTabPadding();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // 后续可接入真实登录 API
    console.log('登录', { account, password });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.logoSection}>
            <View style={styles.divider} />
            <View style={styles.logoWrapper}>
              <Image
                source={require('@/assets/images/splash-icon.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <View style={styles.divider} />
          </View>

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

          <View style={styles.actionSection}>
            <View style={styles.divider} />
            <Pressable
              style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
              onPress={handleLogin}>
              <ThemedText style={styles.loginButtonText}>登录</ThemedText>
            </Pressable>

            <View style={styles.linkRow}>
              <Pressable hitSlop={8}>
                <ThemedText themeColor="textSecondary">忘记密码?</ThemedText>
              </Pressable>
              <Pressable hitSlop={8}>
                <ThemedText style={styles.registerLink}>注册账号</ThemedText>
              </Pressable>
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
  logoSection: {
    paddingTop: Spacing.six,
    paddingBottom: Spacing.five,
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
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E8EC',
  },
  formSection: {
    gap: Spacing.four,
    paddingVertical: Spacing.four,
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
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  loginButton: {
    backgroundColor: BRAND_BLUE,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
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
    marginTop: 'auto',
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
});
