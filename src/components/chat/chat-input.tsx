import { useEffect, useState, type ComponentType } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { requireOptionalNativeModule } from 'expo';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SpeechMicButtonProps = {
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  loading?: boolean;
  onListeningChange: (listening: boolean) => void;
};

type ChatInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function ChatInput({ value, onChangeText, onSend, loading, disabled }: ChatInputProps) {
  const theme = useTheme();
  const canSend = value.trim().length > 0 && !loading && !disabled;
  const [isListening, setIsListening] = useState(false);
  const [SpeechMic, setSpeechMic] = useState<ComponentType<SpeechMicButtonProps> | null>(null);

  useEffect(() => {
    const nativeModule = requireOptionalNativeModule('ExpoSpeechRecognition');
    if (!nativeModule) return;

    import('./speech-mic-button')
      .then((mod) => setSpeechMic(() => mod.SpeechMicButton))
      .catch(() => {
        // 原生模块存在但 JS 包加载失败时忽略
      });
  }, []);

  return (
    <ThemedView style={styles.container}>
      {isListening && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.listeningHint}>
          正在听…
        </ThemedText>
      )}
      <ThemedView type="backgroundElement" style={styles.inputWrapper}>
        {SpeechMic ? (
          <SpeechMic
            value={value}
            onChangeText={onChangeText}
            disabled={disabled}
            loading={loading}
            onListeningChange={setIsListening}
          />
        ) : null}
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="输入消息..."
          placeholderTextColor={theme.textSecondary}
          multiline
          maxLength={2000}
          editable={!loading && !disabled && !isListening}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={({ pressed }) => [
            styles.sendButton,
            { backgroundColor: canSend ? theme.text : theme.backgroundSelected },
            pressed && canSend && styles.pressed,
          ]}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.background} />
          ) : (
            <ThemedText
              type="smallBold"
              style={{ color: canSend ? theme.background : theme.textSecondary }}>
              发送
            </ThemedText>
          )}
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    gap: Spacing.one,
  },
  listeningHint: {
    paddingHorizontal: Spacing.one,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingLeft: Spacing.two,
    paddingRight: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 100,
    paddingVertical: Spacing.one,
  },
  sendButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
