import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SystemIcon } from '@/components/ui/system-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ComplianceNoticeBannerProps = {
  onDismiss: () => void;
};

export function ComplianceNoticeBanner({ onDismiss }: ComplianceNoticeBannerProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.banner}>
      <ThemedView style={styles.textBlock}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
          对话内容可能经海外 API 传输。请自行确保使用合规，勿输入敏感个人信息。
        </ThemedText>
        <Link href="/explore/user-agreement" asChild>
          <Pressable hitSlop={4} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="small" style={styles.link}>
              查看用户协议
            </ThemedText>
          </Pressable>
        </Link>
      </ThemedView>
      <Pressable
        onPress={onDismiss}
        hitSlop={8}
        accessibilityLabel="关闭提示"
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
        <SystemIcon name="close" size={16} color={theme.textSecondary} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: '#F3F4F6',
  },
  textBlock: {
    flex: 1,
    gap: Spacing.half,
    backgroundColor: 'transparent',
  },
  text: {
    lineHeight: 20,
  },
  link: {
    color: '#208AEF',
  },
  closeButton: {
    padding: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
