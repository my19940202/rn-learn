import { useCallback, useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SpeechMicButtonProps = {
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  loading?: boolean;
  onListeningChange: (listening: boolean) => void;
};

export function SpeechMicButton({
  value,
  onChangeText,
  disabled,
  loading,
  onListeningChange,
}: SpeechMicButtonProps) {
  const theme = useTheme();
  const baseTextRef = useRef('');

  useSpeechRecognitionEvent('start', () => {
    onListeningChange(true);
  });

  useSpeechRecognitionEvent('end', () => {
    onListeningChange(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript ?? '';
    if (!transcript) return;
    const prefix = baseTextRef.current;
    const next = prefix ? `${prefix} ${transcript}` : transcript;
    onChangeText(next.trim());
  });

  useSpeechRecognitionEvent('error', () => {
    onListeningChange(false);
  });

  useEffect(() => {
    return () => {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        // 组件卸载时忽略停止错误
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    if (loading || disabled) return;

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) return;

    baseTextRef.current = value.trim();
    await ExpoSpeechRecognitionModule.start({
      lang: 'zh-CN',
      interimResults: true,
      requiresOnDeviceRecognition: Platform.OS === 'ios',
    });
  }, [disabled, loading, value]);

  const stopListening = useCallback(async () => {
    await ExpoSpeechRecognitionModule.stop();
  }, []);

  return (
    <Pressable
      onPressIn={startListening}
      onPressOut={stopListening}
      disabled={loading || disabled}
      style={({ pressed }) => [styles.micButton, pressed && styles.pressed]}>
      <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>
        🎤
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  micButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
