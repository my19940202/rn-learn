import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { createMarkdownStyles } from '@/components/chat/markdown-styles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SystemIcon } from '@/components/ui/system-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChatRole } from '@/types/chat';

type MessageBubbleProps = {
  role: ChatRole;
  content: string;
  /** 由 chat 在 loading 且尚无正文时传入 */
  isTyping?: boolean;
};

function looksLikeMarkdown(content: string): boolean {
  return /(^|\n)(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```)|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\[[^\]]+\]\([^)]+\)/.test(
    content,
  );
}

export function MessageBubble({ role, content, isTyping }: MessageBubbleProps) {
  const theme = useTheme();
  const isUser = role === 'user';
  const trimmed = content.trim();
  const showTyping = !isUser && (isTyping || !trimmed);
  const canCopy = !isUser && !!trimmed && !showTyping;
  const [copied, setCopied] = useState(false);
  const markdownStyles = useMemo(() => createMarkdownStyles(theme), [theme]);

  const handleCopy = async () => {
    if (!trimmed) return;
    await Clipboard.setStringAsync(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bubbleContent = isUser ? (
    <ThemedText type="small" style={styles.text}>
      {content}
    </ThemedText>
  ) : showTyping ? (
    <ThemedText type="small" themeColor="textSecondary">
      正在输入...
    </ThemedText>
  ) : looksLikeMarkdown(content) ? (
    <Markdown style={markdownStyles}>{content}</Markdown>
  ) : (
    <ThemedText type="small" style={styles.text}>
      {content}
    </ThemedText>
  );

  const bubble = (
    <ThemedView
      type={isUser ? 'backgroundSelected' : 'backgroundElement'}
      style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
      {bubbleContent}
    </ThemedView>
  );

  return (
    <ThemedView style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {isUser ? (
        bubble
      ) : (
        <View style={styles.assistantColumn}>
          {bubble}
          {canCopy && (
            <Pressable
              onPress={handleCopy}
              hitSlop={8}
              accessibilityLabel="复制回答"
              style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}>
              <SystemIcon
                name={copied ? 'check' : 'copy'}
                size={16}
                color={copied ? theme.text : theme.textSecondary}
              />
            </Pressable>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  assistantColumn: {
    maxWidth: '85%',
    flexShrink: 0,
    flexGrow: 0,
    alignItems: 'flex-start',
    gap: Spacing.one,
  },
  bubble: {
    flexShrink: 0,
    flexGrow: 0,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  bubbleUser: {
    maxWidth: '85%',
    borderBottomRightRadius: Spacing.half,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: Spacing.half,
  },
  copyButton: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    lineHeight: 22,
    flexShrink: 0,
    width: '100%',
  },
});
