import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function GuestModelBanner() {
  const router = useRouter();

  return (
    <ThemedView style={styles.banner}>
      <ThemedText type="small" style={styles.text} numberOfLines={2}>
        登录后可使用 ChatGPT、Claude、Gemini、Grok 等更多模型
      </ThemedText>
      <Pressable
        onPress={() => router.push('/explore')}
        style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
        <ThemedText type="smallBold" style={styles.linkText}>
          去登录
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: '#EFF6FF',
  },
  text: {
    flex: 1,
    color: '#1D4ED8',
  },
  link: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  linkText: {
    color: '#1D4ED8',
  },
  pressed: {
    opacity: 0.7,
  },
});
