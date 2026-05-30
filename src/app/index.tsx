import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModelIcon } from '@/components/chat/model-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AVAILABLE_MODELS } from '@/constants/models';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBottomTabPadding } from '@/hooks/use-bottom-tab-padding';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

const BRAND_BLUE = '#208AEF';

const FEATURES = [
  '免登录即可使用 DeepSeek 智能对话',
  '登录后解锁 ChatGPT、Claude、Gemini、Grok',
  '统一接入海外模型，低成本按需使用',
];

export default function HomeScreen() {
  const bottomPadding = useBottomTabPadding(Spacing.three);
  const { isAuthenticated } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = useTheme();
  const router = useRouter();

  const primaryButtonTextColor = '#FFFFFF';
  const secondaryButtonColor = isDark ? '#7AB8FF' : BRAND_BLUE;

  const handleModelPress = (modelId: string, requiresAuth: boolean) => {
    if (!isAuthenticated && requiresAuth) {
      router.navigate('/explore');
      return;
    }
    router.navigate({ pathname: '/chat', params: { model: modelId } });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
          showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.heroSection}>
            <Image
              source={require('@/assets/images/splash-icon.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <ThemedText type="title" style={styles.title}>
              AI Link
            </ThemedText>
            <ThemedText type="subtitle" themeColor="textSecondary" style={styles.tagline}>
              低成本使用海外 AI
            </ThemedText>
          </ThemedView>

          <ThemedText themeColor="textSecondary" style={styles.description}>
            AI Link 帮你以更低成本访问 DeepSeek、ChatGPT、Claude 等海外大模型。
            无需复杂配置，打开即用，适合日常问答、写作与灵感探索。
          </ThemedText>

          <View style={styles.modelGrid}>
            {AVAILABLE_MODELS.map((model) => {
              const locked = !isAuthenticated && model.requiresAuth;
              return (
                <Pressable
                  key={model.modelId}
                  onPress={() => handleModelPress(model.modelId, model.requiresAuth)}
                  style={({ pressed }) => [
                    styles.modelCard,
                    { backgroundColor: theme.backgroundElement },
                    pressed && styles.pressed,
                  ]}>
                  <ModelIcon source={model.icon} size={36} locked={locked} />
                  <ThemedText type="small" style={styles.modelLabel}>
                    {model.label}
                  </ThemedText>
                  {locked && (
                    <ThemedText
                      type="small"
                      themeColor="textSecondary"
                      style={styles.modelLock}>
                      登录解锁
                    </ThemedText>
                  )}
                </Pressable>
              );
            })}
          </View>

          <ThemedView type="backgroundElement" style={styles.featureCard}>
            {FEATURES.map((feature) => (
              <ThemedView key={feature} style={styles.featureRow}>
                <ThemedText style={styles.featureBullet}>·</ThemedText>
                <ThemedText type="small" style={styles.featureText}>
                  {feature}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>

          <ThemedView style={styles.actions}>
            <Link href="/chat" asChild>
              <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <ThemedText style={[styles.primaryButtonText, { color: primaryButtonTextColor }]}>
                  开始 Chat
                </ThemedText>
              </Pressable>
            </Link>

            <Link href="/explore" asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { borderColor: secondaryButtonColor },
                  pressed && styles.pressed,
                ]}>
                <ThemedText style={[styles.secondaryButtonText, { color: secondaryButtonColor }]}>
                  {isAuthenticated ? '我的账户' : '点击登录'}
                </ThemedText>
              </Pressable>
            </Link>
          </ThemedView>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    gap: Spacing.four,
  },
  heroSection: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  logo: {
    width: 72,
    height: 72,
  },
  title: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
  },
  tagline: {
    textAlign: 'center',
  },
  description: {
    lineHeight: 24,
    textAlign: 'center',
  },
  modelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  modelCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.three,
    width: 80,
  },
  modelLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  modelLock: {
    fontSize: 10,
    textAlign: 'center',
  },
  featureCard: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  featureBullet: {
    lineHeight: 22,
    fontSize: 18,
  },
  featureText: {
    flex: 1,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  primaryButton: {
    backgroundColor: BRAND_BLUE,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BRAND_BLUE,
    backgroundColor: 'transparent',
    flex: 1,
  },
  secondaryButtonText: {
    color: BRAND_BLUE,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
