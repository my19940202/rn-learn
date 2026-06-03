import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { ConversationHistory } from '@/components/chat/conversation-history';
import { GuestModelBanner } from '@/components/chat/guest-model-banner';
import { MessageBubble } from '@/components/chat/message-bubble';
import { ModelPicker } from '@/components/chat/model-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  GUEST_MODEL,
  LOGGED_IN_DEFAULT_MODEL,
  getModelById,
} from '@/constants/models';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useBottomTabPadding } from '@/hooks/use-bottom-tab-padding';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import {
  fetchConversationDetail,
  getChatApiUrl,
  uiMessagesToApiMessages,
  type Conversation,
} from '@/services/chat-api';
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
  const bottomPadding = useBottomTabPadding(Spacing.one);
  const { visible: keyboardVisible } = useKeyboardVisible();
  const router = useRouter();
  const { token, user } = useAuth();
  const isAuthenticated = !!token;
  const params = useLocalSearchParams<{ model?: string }>();
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(
    isAuthenticated ? LOGGED_IN_DEFAULT_MODEL : GUEST_MODEL,
  );
  const [historyVisible, setHistoryVisible] = useState(false);
  const [chatSessionId, setChatSessionId] = useState('default');
  const [loadedMessages, setLoadedMessages] = useState<UIMessage[] | null>(null);
  const listRef = useRef<FlatList<UIMessage>>(null);
  const scrollPendingRef = useRef(false);
  const appliedModelParam = useRef<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const modelParam = params.model;
    if (modelParam && modelParam !== appliedModelParam.current && isAuthenticated) {
      const modelDef = getModelById(modelParam);
      if (modelDef && (!modelDef.requiresAuth || isAuthenticated)) {
        appliedModelParam.current = modelParam;
        setSelectedModel(modelParam);
        setLoadedMessages(null);
        conversationIdRef.current = null;
        setChatSessionId(`model-${Date.now()}`);
      }
    }
  }, [params.model, isAuthenticated]);

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
        fetch: (async (input, init) => {
          const response = await (expoFetch as unknown as typeof globalThis.fetch)(
            input,
            init,
          );
          const conversationId = response.headers.get('X-Conversation-Id');
          if (conversationId) {
            conversationIdRef.current = conversationId;
          }
          return response;
        }) as typeof globalThis.fetch,
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
              ...(conversationIdRef.current
                ? { conversationId: conversationIdRef.current }
                : {}),
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
    id: chatSessionId,
    transport,
    messages: loadedMessages ?? initialMessages,
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

  const handleHistoryPress = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/explore');
      return;
    }
    setHistoryVisible(true);
  }, [isAuthenticated, router]);

  const handleSelectConversation = useCallback(
    async (conv: Conversation) => {
      if (!token) return;
      try {
        const detail = await fetchConversationDetail(token, conv.id);
        const uiMessages: UIMessage[] = detail.messages.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          parts: [{ type: 'text' as const, text: msg.content }],
        }));
        setSelectedModel(conv.model);
        setLoadedMessages(uiMessages.length > 0 ? uiMessages : null);
        conversationIdRef.current = conv.id;
        setChatSessionId(`conv-${conv.id}`);
      } catch {}
    },
    [token],
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.header}>
          <ModelPicker
            value={effectiveModel}
            onChange={setSelectedModel}
            isAuthenticated={isAuthenticated}
            disabled={loading}
            onHistoryPress={handleHistoryPress}
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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? Spacing.three : 0}>
          <FlatList
            ref={listRef}
            style={styles.messageListContainer}
            data={messages}
            extraData={loading}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              const content = getMessageText(item);
              const role = item.role === 'user' ? 'user' : 'assistant';
              const isLast = index === messages.length - 1;
              const isTyping =
                loading &&
                role === 'assistant' &&
                isLast &&
                content.trim() === '';

              return (
                <MessageBubble role={role} content={content} isTyping={isTyping} />
              );
            }}
            ListFooterComponent={
              loading && messages[messages.length - 1]?.role === 'user' ? (
                <MessageBubble role="assistant" content="" isTyping />
              ) : null
            }
            contentContainerStyle={styles.messageList}
            onContentSizeChange={scrollToEnd}
            keyboardShouldPersistTaps="handled"
          />

          <ThemedView
            style={{
              paddingBottom:
                Platform.OS === 'android'
                  ? keyboardVisible
                    ? Spacing.four
                    : bottomPadding
                  : keyboardVisible
                    ? 0
                    : bottomPadding,
            }}>
            <ChatInput
              value={input}
              onChangeText={setInput}
              onSend={handleSend}
              loading={loading}
            />
          </ThemedView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {isAuthenticated && token && (
        <ConversationHistory
          visible={historyVisible}
          onClose={() => setHistoryVisible(false)}
          onSelect={handleSelectConversation}
          token={token}
        />
      )}
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
