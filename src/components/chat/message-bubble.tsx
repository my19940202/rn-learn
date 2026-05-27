import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { ChatMessage } from '@/services/deepseek';

type MessageBubbleProps = {
  role: ChatMessage['role'];
  content: string;
};

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <ThemedView
      style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <ThemedView
        type={isUser ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <ThemedText type="small" style={styles.text}>
          {content}
        </ThemedText>
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
