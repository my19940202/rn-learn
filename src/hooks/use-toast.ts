import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, ToastAndroid } from 'react-native';

export function useToast(durationMs = 2500) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setMessage(null);
  }, []);

  const show = useCallback(
    (text: string) => {
      if (Platform.OS === 'android') {
        ToastAndroid.show(text, ToastAndroid.SHORT);
        return;
      }
      hide();
      setMessage(text);
      timerRef.current = setTimeout(hide, durationMs);
    },
    [durationMs, hide],
  );

  useEffect(() => () => hide(), [hide]);

  return { toastMessage: message, showToast: show, hideToast: hide };
}
