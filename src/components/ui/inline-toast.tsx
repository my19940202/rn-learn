import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type InlineToastProps = {
  message: string | null;
};

/** iOS / Web 等非 ToastAndroid 平台使用 */
export function InlineToast({ message }: InlineToastProps) {
  if (!message) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.toast}>
        <ThemedText type="small" style={styles.text}>
          {message}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: 120,
    alignItems: 'center',
    zIndex: 100,
  },
  toast: {
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    maxWidth: 320,
  },
  text: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
