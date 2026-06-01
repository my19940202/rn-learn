import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  formatCreatedAt,
  formatQuotaUsage,
  getPlanByTier,
  PLANS,
  type PlanTier,
} from '@/constants/plans';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBottomTabPadding } from '@/hooks/use-bottom-tab-padding';
import { resolveAssetUrl, uploadAvatar } from '@/services/chat-api';

const BRAND_BLUE = '#208AEF';
const FALLBACK_LIMITS = {
  daily_standard: 10,
  monthly_standard: null,
  monthly_premium: 0,
  unlimited: false,
};

export default function ProfileScreen() {
  const bottomPadding = useBottomTabPadding();
  const router = useRouter();
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuth();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('pro');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const currentTier = (user?.plan_tier ?? 'free') as PlanTier;
  const currentPlan = useMemo(() => getPlanByTier(currentTier), [currentTier]);
  const avatarUrl = resolveAssetUrl(user?.avatar_url);
  const usageText = formatQuotaUsage(
    currentTier,
    {
      daily_standard_used: user?.daily_standard_used ?? 0,
      monthly_standard_used: user?.monthly_standard_used ?? 0,
      monthly_premium_used: user?.monthly_premium_used ?? 0,
    },
    user?.limits ?? FALLBACK_LIMITS,
  );
  const displayName = user?.name?.trim() || '用户';
  const avatarFallback = displayName.slice(0, 1).toUpperCase();

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

  const openPlanModal = (tier: PlanTier) => {
    setSelectedPlan(tier);
    setQrVisible(true);
  };

  const handleAvatarPress = async () => {
    if (!token || uploadingAvatar) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('需要相册权限', '请允许访问相册后再上传头像。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    try {
      const nextUser = await uploadAvatar(token, result.assets[0].uri);
      await updateUser(nextUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : '头像上传失败');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <ScrollView
            contentContainerStyle={[styles.profileScrollContent, { paddingBottom: bottomPadding }]}
            showsVerticalScrollIndicator={false}>
            <View style={styles.profileSection}>
              <Pressable
                onPress={handleAvatarPress}
                style={({ pressed }) => [
                  styles.avatarButton,
                  pressed && styles.pressed,
                  uploadingAvatar && styles.avatarButtonDisabled,
                ]}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <ThemedText type="subtitle" style={styles.avatarFallbackText}>
                      {avatarFallback}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.avatarEditBadge}>
                  {uploadingAvatar ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.avatarEditBadgeText}>改</ThemedText>
                  )}
                </View>
              </Pressable>

              <ThemedText type="subtitle" style={styles.profileName}>
                {displayName}
              </ThemedText>
              <ThemedText themeColor="textSecondary">{user.email}</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                创建时间：{formatCreatedAt(user.created_at)}
              </ThemedText>

              {error && (
                <ThemedView style={styles.errorBanner}>
                  <ThemedText type="small" style={styles.errorText}>
                    {error}
                  </ThemedText>
                </ThemedView>
              )}

              <ThemedView style={styles.currentPlanCard} type="backgroundElement">
                <View style={styles.currentPlanHeader}>
                  <View>
                    <ThemedText type="small" themeColor="textSecondary">
                      当前套餐
                    </ThemedText>
                    <ThemedText style={styles.currentPlanName}>{currentPlan.name}</ThemedText>
                  </View>
                  <View
                    style={[
                      styles.currentPlanBadge,
                      { backgroundColor: `${currentPlan.accentColor}1A` },
                    ]}>
                    <ThemedText style={[styles.currentPlanBadgeText, { color: currentPlan.accentColor }]}>
                      {currentTier.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  {usageText}
                </ThemedText>
              </ThemedView>

              <ThemedText type="small" themeColor="textSecondary" style={styles.planScrollHint}>
                左右滑动查看不同套餐
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                contentContainerStyle={styles.planList}>
                {PLANS.map((plan) => {
                  const isCurrent = currentTier === plan.tier;
                  const buttonText =
                    plan.tier === 'free'
                      ? isCurrent
                        ? '当前订阅'
                        : '默认方案'
                      : isCurrent
                        ? '当前订阅'
                        : '立即开通';

                  return (
                    <View
                      key={plan.tier}
                      style={[
                        styles.planCard,
                        isCurrent && {
                          borderColor: plan.accentColor,
                          shadowColor: plan.accentColor,
                        },
                      ]}>
                      <View style={styles.planHeader}>
                        <ThemedText style={styles.planName}>{plan.name}</ThemedText>
                        {isCurrent ? (
                          <View
                            style={[
                              styles.planTag,
                              { backgroundColor: `${plan.accentColor}1A` },
                            ]}>
                            <ThemedText style={[styles.planTagText, { color: plan.accentColor }]}>
                              当前
                            </ThemedText>
                          </View>
                        ) : null}
                      </View>
                      <ThemedText style={styles.planPrice}>{plan.price}</ThemedText>
                      {plan.priceNote ? (
                        <ThemedText type="small" themeColor="textSecondary">
                          {plan.priceNote}
                        </ThemedText>
                      ) : null}

                      <View style={styles.planSection}>
                        <ThemedText type="smallBold">{plan.standardQuota}</ThemedText>
                        {plan.standardModels.map((modelName) => (
                          <ThemedText key={modelName} type="small" themeColor="textSecondary">
                            {`\u2022 ${modelName}`}
                          </ThemedText>
                        ))}
                      </View>

                      {plan.premiumQuota ? (
                        <View style={styles.planSection}>
                          <ThemedText type="smallBold">{plan.premiumQuota}</ThemedText>
                          {plan.premiumModels?.map((modelName) => (
                            <ThemedText key={modelName} type="small" themeColor="textSecondary">
                              {`\u2022 ${modelName}`}
                            </ThemedText>
                          ))}
                        </View>
                      ) : null}

                      <Pressable
                        onPress={() => (plan.tier === 'free' ? undefined : openPlanModal(plan.tier))}
                        disabled={plan.tier === 'free' || isCurrent}
                        style={({ pressed }) => [
                          styles.planButton,
                          {
                            backgroundColor:
                              plan.tier === 'free' || isCurrent ? '#E5E7EB' : plan.accentColor,
                          },
                          pressed && styles.pressed,
                        ]}>
                        <ThemedText
                          style={[
                            styles.planButtonText,
                            { color: plan.tier === 'free' || isCurrent ? '#6B7280' : '#FFFFFF' },
                          ]}>
                          {buttonText}
                        </ThemedText>
                      </Pressable>
                    </View>
                  );
                })}
              </ScrollView>

              <Pressable
                style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
                onPress={handleLogout}>
                <ThemedText style={styles.logoutButtonText}>退出登录</ThemedText>
              </Pressable>
            </View>
          </ScrollView>

          <Modal visible={qrVisible} transparent animationType="fade" onRequestClose={() => setQrVisible(false)}>
            <View style={styles.modalBackdrop}>
              <Pressable style={styles.modalOverlay} onPress={() => setQrVisible(false)} />
              <ThemedView style={styles.modalCard}>
                <ThemedText type="subtitle" style={styles.modalTitle}>
                  {getPlanByTier(selectedPlan).name} 套餐
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.modalSubtitle}>
                  微信扫码后联系管理员手动开通，建议备注你的注册邮箱。
                </ThemedText>
                <Image
                  source={require('@/assets/images/wxcode.jpg')}
                  style={styles.qrCode}
                  contentFit="contain"
                />
                <Pressable
                  style={({ pressed }) => [styles.modalButton, pressed && styles.pressed]}
                  onPress={() => setQrVisible(false)}>
                  <ThemedText style={styles.modalButtonText}>我知道了</ThemedText>
                </Pressable>
              </ThemedView>
            </View>
          </Modal>
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
    gap: Spacing.three,
  },
  profileScrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  avatarButton: {
    alignSelf: 'center',
    marginTop: Spacing.one,
  },
  avatarButtonDisabled: {
    opacity: 0.75,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9EEF7',
  },
  avatarFallbackText: {
    color: BRAND_BLUE,
  },
  avatarEditBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BRAND_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarEditBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  profileName: {
    marginTop: Spacing.one,
    textAlign: 'center',
  },
  currentPlanCard: {
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPlanName: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  currentPlanBadge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  currentPlanBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  planScrollHint: {
    marginBottom: Spacing.two,
  },
  planList: {
    gap: Spacing.three,
    paddingRight: Spacing.four,
  },
  planCard: {
    width: 240,
    borderRadius: 24,
    padding: Spacing.three,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    gap: Spacing.three,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: '#111827',
  },
  planTag: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  planTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  planPrice: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#111827',
  },
  planSection: {
    gap: Spacing.one,
  },
  planButton: {
    borderRadius: 999,
    alignItems: 'center',
    paddingVertical: 14,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '700',
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
    marginTop: Spacing.one,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: Spacing.four,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
  },
  modalTitle: {
    textAlign: 'center',
  },
  modalSubtitle: {
    textAlign: 'center',
  },
  qrCode: {
    width: 220,
    height: 220,
    borderRadius: 24,
  },
  modalButton: {
    width: '100%',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: BRAND_BLUE,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
