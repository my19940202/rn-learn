import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, Spacing } from '@/constants/theme';

/** Tab 页底部留白 = 系统安全区 + NativeTabs 高度 + 额外间距 */
export function useBottomTabPadding(extra: number = Spacing.three) {
  const insets = useSafeAreaInsets();
  const safeAreaBottom = Platform.OS === 'android' ? 0 : insets.bottom;
  return safeAreaBottom + BottomTabInset + extra;
}
