import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatInput } from '@/components/chat/chat-input';
import { MessageBubble } from '@/components/chat/message-bubble';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBottomTabPadding } from '@/hooks/use-bottom-tab-padding';
import {
  isDeepSeekConfigured,
  sendChat,
  type ChatMessage,
} from '@/services/deepseek';

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: '你好！我是 DeepSeek 助手，有什么可以帮你的？',
};

export default function ChatScreen() {
  const bottomPadding = useBottomTabPadding(Spacing.two);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setError(null);
    setLoading(true);
    scrollToEnd();

    try {
      const reply = await sendChat(nextMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      scrollToEnd();
    } catch (err) {
      const message = err instanceof Error ? err.message : '发送失败，请重试';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, scrollToEnd]);

  const configured = isDeepSeekConfigured();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            Chat
          </ThemedText>
          {!configured && (
            <ThemedView type="backgroundElement" style={styles.configHint}>
              <ThemedText type="small" themeColor="textSecondary">
                请在项目根目录创建 .env 并设置 EXPO_PUBLIC_DEEPSEEK_API_KEY，然后重启
                Expo。
              </ThemedText>
            </ThemedView>
          )}
          {error && (
            <ThemedView style={styles.errorBanner}>
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(_, index) => `${index}`}
            renderItem={({ item }) => (
              <MessageBubble role={item.role} content={item.content} />
            )}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={scrollToEnd}
            keyboardShouldPersistTaps="handled"
          />

          <ThemedView style={{ paddingBottom: bottomPadding }}>
            <ChatInput
              value={input}
              onChangeText={setInput}
              onSend={handleSend}
              loading={loading}
              disabled={!configured}
            />
          </ThemedView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
  },
  configHint: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
  errorText: {
    color: '#B91C1C',
  },
  keyboardView: {
    flex: 1,
  },
  messageList: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    flexGrow: 1,
  },
});
