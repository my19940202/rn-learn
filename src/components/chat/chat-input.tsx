import { ActivityIndicator, Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChatInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  loading?: boolean;
  /** 仅禁用发送，不影响输入框聚焦与键盘 */
  sendDisabled?: boolean;
};

export function ChatInput({
  value,
  onChangeText,
  onSend,
  loading,
  sendDisabled,
}: ChatInputProps) {
  const theme = useTheme();
  const canSend = value.trim().length > 0 && !loading && !sendDisabled;

  return (
    <ThemedView style={styles.container}>
      <ThemedView type="backgroundElement" style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={
            sendDisabled ? '已达游客对话上限，请登录后继续' : '输入消息...'
          }
          placeholderTextColor={theme.textSecondary}
          multiline
          maxLength={2000}
          editable={!loading}
          returnKeyType="send"
          blurOnSubmit={false}
          showSoftInputOnFocus
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
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 36,
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
