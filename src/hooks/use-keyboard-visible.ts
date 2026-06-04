import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

export interface KeyboardState {
  visible: boolean;
  height: number;
}

type UseKeyboardVisibleOptions = {
  /** Android 上延迟隐藏，避免布局变化触发 keyboardDidHide 造成状态震荡 */
  hideDelayMs?: number;
};

export function useKeyboardVisible(options?: UseKeyboardVisibleOptions): KeyboardState {
  const [visible, setVisible] = useState(false);
  const [height, setHeight] = useState(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideDelayMs =
    options?.hideDelayMs ?? (Platform.OS === 'android' ? 120 : 0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const clearHideTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const handleShow = (e: KeyboardEvent) => {
      clearHideTimer();
      setVisible(true);
      setHeight(e.endCoordinates?.height ?? 0);
    };

    const handleHide = () => {
      clearHideTimer();
      if (hideDelayMs > 0) {
        hideTimerRef.current = setTimeout(() => {
          setVisible(false);
          setHeight(0);
          hideTimerRef.current = null;
        }, hideDelayMs);
        return;
      }
      setVisible(false);
      setHeight(0);
    };

    const showSub = Keyboard.addListener(showEvent, handleShow);
    const hideSub = Keyboard.addListener(hideEvent, handleHide);

    return () => {
      clearHideTimer();
      showSub.remove();
      hideSub.remove();
    };
  }, [hideDelayMs]);

  return { visible, height };
}
