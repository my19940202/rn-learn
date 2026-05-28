import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import type { UIMessage } from 'ai';

import { ChatInput } from '@/components/chat/chat-input';
import { MessageBubble } from '@/components/chat/message-bubble';
import { ModelPicker } from '@/components/chat/model-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DEFAULT_MODEL } from '@/constants/models';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBottomTabPadding } from '@/hooks/use-bottom-tab-padding';
import { getChatApiUrl, uiMessagesToApiMessages } from '@/services/chat-api';
import { OpenAISSEChatTransport } from '@/services/openai-sse-chat-transport';

const WELCOME_MESSAGE: UIMessage = {
  id: 'welcome',
  role: 'assistant',
  parts: [{ type: 'text', text: '你好！我是 AI 助手，有什么可以帮你的？' }],
};

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export default function ChatScreen() {
  const bottomPadding = useBottomTabPadding(Spacing.two);
  const { token } = useAuth();
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const listRef = useRef<FlatList<UIMessage>>(null);
  const scrollPendingRef = useRef(false);

  const transport = useMemo(
    () =>
      new OpenAISSEChatTransport({
        api: getChatApiUrl(),
        fetch: expoFetch as unknown as typeof globalThis.fetch,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: { model: selectedModel },
        prepareSendMessagesRequest: ({ headers, body, messages }) => ({
          headers,
          body: {
            ...body,
            model: selectedModel,
            messages: uiMessagesToApiMessages(messages),
          },
        }),
      }),
    [selectedModel, token],
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: [WELCOME_MESSAGE],
  });

  const loading = status === 'streaming' || status === 'submitted';

  const scrollToEnd = useCallback(() => {
    if (scrollPendingRef.current) return;
    scrollPendingRef.current = true;
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
      scrollPendingRef.current = false;
    });
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput('');
    await sendMessage({ text: trimmed });
    scrollToEnd();
  }, [input, loading, scrollToEnd, sendMessage]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            Chat
          </ThemedText>
          <ModelPicker
            value={selectedModel}
            onChange={setSelectedModel}
            disabled={loading}
          />
          {error && (
            <ThemedView style={styles.errorBanner}>
              <ThemedText type="small" style={styles.errorText}>
                {error.message}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}>
          <FlatList
            ref={listRef}
            data={messages}
            extraData={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble
                role={item.role === 'user' ? 'user' : 'assistant'}
                content={getMessageText(item)}
              />
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
              disabled={!token}
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
