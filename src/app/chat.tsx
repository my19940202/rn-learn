import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatInput } from '@/components/chat/chat-input';
import { GuestModelBanner } from '@/components/chat/guest-model-banner';
import { MessageBubble } from '@/components/chat/message-bubble';
import { ModelPicker } from '@/components/chat/model-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  GUEST_MODEL,
  LOGGED_IN_DEFAULT_MODEL,
} from '@/constants/models';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBottomTabPadding } from '@/hooks/use-bottom-tab-padding';
import { getChatApiUrl, uiMessagesToApiMessages } from '@/services/chat-api';
import { OpenAISSEChatTransport } from '@/services/openai-sse-chat-transport';

const GUEST_WELCOME_MESSAGE: UIMessage = {
  id: 'welcome',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: '你好！我是 AI 助手，当前使用 DeepSeek 为你解答。登录后可切换 ChatGPT、Claude 等更多模型。',
    },
  ],
};

const LOGGED_IN_WELCOME_MESSAGE: UIMessage = {
  id: 'welcome',
  role: 'system',
  parts: [{ type: 'text', text: '你好！我是 AI 小助手，有什么可以帮你的？' }],
};

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export default function ChatScreen() {
  const bottomPadding = useBottomTabPadding(Spacing.two);
  const { token, user } = useAuth();
  const isAuthenticated = !!token;
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(
    isAuthenticated ? LOGGED_IN_DEFAULT_MODEL : GUEST_MODEL,
  );
  const listRef = useRef<FlatList<UIMessage>>(null);
  const scrollPendingRef = useRef(false);

  const effectiveModel = isAuthenticated ? selectedModel : GUEST_MODEL;

  const effectiveModelRef = useRef(effectiveModel);
  const tokenRef = useRef(token);
  const userRef = useRef(user);
  effectiveModelRef.current = effectiveModel;
  tokenRef.current = token;
  userRef.current = user;

  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedModel(GUEST_MODEL);
      return;
    }
    setSelectedModel((current) =>
      current === GUEST_MODEL ? LOGGED_IN_DEFAULT_MODEL : current,
    );
  }, [isAuthenticated]);

  const transport = useMemo(
    () =>
      new OpenAISSEChatTransport({
        api: getChatApiUrl(),
        fetch: expoFetch as unknown as typeof globalThis.fetch,
        prepareSendMessagesRequest: ({ headers, body, messages }) => {
          const currentToken = tokenRef.current;
          const currentUser = userRef.current;
          return {
            headers: currentToken
              ? { ...headers, Authorization: `Bearer ${currentToken}` }
              : headers,
            body: {
              ...body,
              model: effectiveModelRef.current,
              messages: uiMessagesToApiMessages(messages),
              ...(currentToken && currentUser
                ? {
                    userId: currentUser.id,
                    userEmail: currentUser.email,
                    ...(currentUser.name ? { userName: currentUser.name } : {}),
                  }
                : { userId: 'demo-user' }),
            },
          };
        },
      }),
    [],
  );

  const initialMessages = isAuthenticated
    ? [LOGGED_IN_WELCOME_MESSAGE]
    : [GUEST_WELCOME_MESSAGE];

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: initialMessages,
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
          <ModelPicker
            value={effectiveModel}
            onChange={setSelectedModel}
            isAuthenticated={isAuthenticated}
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

        {!isAuthenticated && <GuestModelBanner />}

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? Spacing.three : 0}>
          <FlatList
            ref={listRef}
            style={styles.messageListContainer}
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
  },
  errorBanner: {
    marginTop: Spacing.two,
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
  messageListContainer: {
    flex: 1,
  },
  messageList: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    flexGrow: 1,
  },
});
