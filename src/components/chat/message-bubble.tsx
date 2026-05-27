import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { createMarkdownStyles } from '@/components/chat/markdown-styles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ChatMessage } from '@/services/deepseek';

type MessageBubbleProps = {
  role: ChatMessage['role'];
  content: string;
};

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const theme = useTheme();
  const isUser = role === 'user';
  const markdownStyles = useMemo(() => createMarkdownStyles(theme), [theme]);

  return (
    <ThemedView
      style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <ThemedView
        type={isUser ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {isUser ? (
          <ThemedText type="small" style={styles.text}>
            {content}
          </ThemedText>
        ) : content ? (
          <Markdown style={markdownStyles}>{content}</Markdown>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            正在输入...
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  bubbleUser: {
    borderBottomRightRadius: Spacing.half,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: Spacing.half,
  },
  text: {
    lineHeight: 22,
  },
});
