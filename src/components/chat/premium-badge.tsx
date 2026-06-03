import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PREMIUM_ACCENT } from '@/constants/models';
import { Spacing } from '@/constants/theme';

export function PremiumBadge() {
  return (
    <View style={styles.badge}>
      <ThemedText style={styles.text}>高级模型</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: `${PREMIUM_ACCENT}1A`,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.two,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    color: PREMIUM_ACCENT,
  },
});
