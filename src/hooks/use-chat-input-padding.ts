import { useMemo } from 'react';
import { Platform } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useBottomTabPadding } from '@/hooks/use-bottom-tab-padding';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';

/**
 * 聊天页输入区底部留白。
 * - iOS：KeyboardAvoidingView 负责避让，键盘弹起时不额外留白。
 * - Android：依赖 pan 模式 + 系统平移；键盘弹起时仅保留少量间距，避免与 Tab Bar 高度叠加造成双重避让。
 */
export function useChatInputBottomPadding(extra: number = Spacing.one) {
  const bottomPadding = useBottomTabPadding(extra);
  const { visible } = useKeyboardVisible();

  return useMemo(() => {
    if (Platform.OS === 'ios') {
      return visible ? 0 : bottomPadding;
    }
    return visible ? Spacing.two : bottomPadding;
  }, [visible, bottomPadding]);
}
