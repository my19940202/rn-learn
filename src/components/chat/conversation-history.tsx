import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModelIcon } from '@/components/chat/model-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getModelById } from '@/constants/models';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  deleteConversation,
  fetchConversations,
  type Conversation,
} from '@/services/chat-api';
import { SystemIcon } from '../ui/system-icon';

type ConversationHistoryProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (conversation: Conversation) => void;
  token: string;
};

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export function ConversationHistory({
  visible,
  onClose,
  onSelect,
  token,
}: ConversationHistoryProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchConversations(token);
      setConversations(list);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (visible) loadConversations();
  }, [visible, loadConversations]);

  const handleDelete = useCallback(
    (conv: Conversation) => {
      Alert.alert('删除对话', `确定删除「${conv.title}」？`, [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation(token, conv.id);
              setConversations((prev) => prev.filter((c) => c.id !== conv.id));
            } catch {}
          },
        },
      ]);
    },
    [token],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <ThemedView
              style={[
                styles.sheet,
                { paddingBottom: Math.max(insets.bottom, Spacing.three) },
              ]}>
              <ThemedView style={styles.sheetHeader}>
                <ThemedText type="subtitle">历史对话</ThemedText>
                <Pressable onPress={onClose} hitSlop={8}>
                  <SystemIcon name="close" size={18} color={theme.textSecondary} />
                </Pressable>
              </ThemedView>

              {loading ? (
                <ThemedView style={styles.emptyState}>
                  <ActivityIndicator size="small" />
                </ThemedView>
              ) : conversations.length === 0 ? (
                <ThemedView style={styles.emptyState}>
                  <SystemIcon name="chat-bubble" size={40} color={theme.textSecondary} />
                  <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                    暂无历史对话
                  </ThemedText>
                </ThemedView>
              ) : (
                <ScrollView bounces={false} style={styles.list}>
                  {conversations.map((conv) => {
                    const model = getModelById(conv.model);
                    return (
                      <Pressable
                        key={conv.id}
                        onPress={() => {
                          onSelect(conv);
                          onClose();
                        }}
                        onLongPress={() => handleDelete(conv)}
                        style={({ pressed }) => [
                          styles.row,
                          pressed && styles.pressed,
                        ]}>
                        {model && <ModelIcon source={model.icon} size={28} />}
                        <ThemedView style={styles.rowContent}>
                          <ThemedText numberOfLines={1} style={styles.convTitle}>
                            {conv.title}
                          </ThemedText>
                          <ThemedView style={styles.rowMeta}>
                            {model && (
                              <ThemedText type="small" themeColor="textSecondary">
                                {model.label}
                              </ThemedText>
                            )}
                            <ThemedText type="small" themeColor="textSecondary">
                              {formatTime(conv.updated_at)}
                            </ThemedText>
                          </ThemedView>
                        </ThemedView>
                        <SystemIcon name="chevron-right" size={14} color={theme.textSecondary} />
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </ThemedView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingTop: Spacing.three,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  list: {
    paddingHorizontal: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    minHeight: 56,
  },
  pressed: {
    opacity: 0.7,
  },
  rowContent: {
    flex: 1,
    gap: 2,
    backgroundColor: 'transparent',
  },
  convTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowMeta: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.three,
  },
  emptyText: {
    fontSize: 14,
  },
});
