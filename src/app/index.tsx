import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModelIcon } from '@/components/chat/model-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HOME_FEATURED_MODELS } from '@/constants/models';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBottomTabPadding } from '@/hooks/use-bottom-tab-padding';
import { useTheme } from '@/hooks/use-theme';

const VALUE_TAGS = [
  { label: '便捷', hint: '免配置不折腾' },
  { label: '多模型', hint: 'GPT / Claude / Gemini' },
  { label: '合规自用', hint: '仅供个人学习研究' },
] as const;

const FEATURES = [
  '登录后解锁 ChatGPT、Claude、Gemini、Grok',
  '统一接入海外模型，一键使用不折腾',
];

export default function HomeScreen() {
  const bottomPadding = useBottomTabPadding(Spacing.three);
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const router = useRouter();

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
              国内用户的海外 AI 工具箱
            </ThemedText>
          </ThemedView>

          <View style={styles.tagRow}>
            {VALUE_TAGS.map((tag) => (
              <ThemedView
                key={tag.label}
                type="backgroundElement"
                style={[styles.valueTag, { borderColor: theme.backgroundSelected }]}>
                <ThemedText type="smallBold">{tag.label}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.tagHint}>
                  {tag.hint}
                </ThemedText>
              </ThemedView>
            ))}
          </View>

          <View style={styles.modelGrid}>
            {HOME_FEATURED_MODELS.map((model) => {
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
  tagRow: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  valueTag: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 50,
  },
  tagHint: {
    fontSize: 11,
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
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
    width: 70,
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
  pressed: {
    opacity: 0.85,
  },
});
