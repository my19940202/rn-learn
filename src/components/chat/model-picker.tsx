import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
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
import { AVAILABLE_MODELS, getModelById } from '@/constants/models';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ModelPickerProps = {
  value: string;
  onChange: (modelId: string) => void;
  isAuthenticated: boolean;
  disabled?: boolean;
};

export function ModelPicker({
  value,
  onChange,
  isAuthenticated,
  disabled,
}: ModelPickerProps) {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentModel = getModelById(value) ?? AVAILABLE_MODELS[0];

  const openModal = () => {
    if (disabled) return;
    setVisible(true);
  };

  const closeModal = () => setVisible(false);

  const handleSelect = (modelId: string, requiresAuth: boolean) => {
    if (!isAuthenticated && requiresAuth) {
      closeModal();
      router.push('/explore');
      return;
    }
    onChange(modelId);
    closeModal();
  };

  return (
    <>
      <Pressable
        onPress={openModal}
        disabled={disabled}
        style={({ pressed }) => [
          styles.trigger,
          disabled && styles.triggerDisabled,
          pressed && !disabled && styles.pressed,
        ]}>
        <ModelIcon source={currentModel.icon} size={28} />
        <ThemedText type="subtitle" style={styles.triggerLabel}>
          {currentModel.label}
        </ThemedText>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
          size={14}
          weight="semibold"
          tintColor={theme.textSecondary}
        />
      </Pressable>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <ThemedView
                style={[
                  styles.sheet,
                  { paddingBottom: Math.max(insets.bottom, Spacing.three) },
                ]}>
                <ThemedView style={styles.sheetHeader}>
                  <ThemedText type="subtitle">选择模型</ThemedText>
                  <Pressable onPress={closeModal} hitSlop={8}>
                    <SymbolView
                      name={{ ios: 'xmark', android: 'close', web: 'close' }}
                      size={18}
                      tintColor={theme.textSecondary}
                    />
                  </Pressable>
                </ThemedView>

                {!isAuthenticated && (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
                    登录后可使用 ChatGPT、Claude、Gemini、Grok 等更多模型
                  </ThemedText>
                )}

                <ScrollView bounces={false} style={styles.list}>
                  {AVAILABLE_MODELS.map((model) => {
                    const locked = !isAuthenticated && model.requiresAuth;
                    const selected = model.modelId === value;

                    return (
                      <Pressable
                        key={model.modelId}
                        onPress={() => handleSelect(model.modelId, model.requiresAuth)}
                        style={({ pressed }) => [
                          styles.row,
                          selected && { backgroundColor: theme.backgroundSelected },
                          pressed && styles.pressed,
                        ]}>
                        <ModelIcon
                          source={model.icon}
                          size={32}
                          selected={selected}
                          locked={locked}
                        />
                        <ThemedView style={styles.rowText}>
                          <ThemedText type="smallBold">{model.label}</ThemedText>
                          {locked && (
                            <ThemedText type="small" themeColor="textSecondary">
                              登录解锁
                            </ThemedText>
                          )}
                        </ThemedView>
                        {selected && (
                          <SymbolView
                            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                            size={18}
                            weight="semibold"
                            tintColor={theme.text}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </ThemedView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerLabel: {
    fontSize: 22,
    lineHeight: 28,
  },
  pressed: {
    opacity: 0.7,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingTop: Spacing.three,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  hint: {
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
  rowText: {
    flex: 1,
    gap: 2,
    backgroundColor: 'transparent',
  },
});
