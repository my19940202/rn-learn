import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
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
import { PremiumBadge } from '@/components/chat/premium-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SystemIcon } from '@/components/ui/system-icon';
import {
  AVAILABLE_MODELS,
  formatModelShortName,
  getModelById,
  PREMIUM_MODELS,
  STANDARD_MODELS,
  type ModelOption,
} from '@/constants/models';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ModelPickerProps = {
  value: string;
  onChange: (modelId: string) => void;
  isAuthenticated: boolean;
  disabled?: boolean;
  onHistoryPress: () => void;
};

const MODEL_SECTIONS = [
  { title: '普通模型', models: STANDARD_MODELS },
  { title: '高级模型', models: PREMIUM_MODELS },
] as const;

type ModelRowProps = {
  model: ModelOption;
  selected: boolean;
  locked: boolean;
  onSelect: (modelId: string, requiresAuth: boolean) => void;
};

function ModelRow({ model, selected, locked, onSelect }: ModelRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => onSelect(model.modelId, model.requiresAuth)}
      style={({ pressed }) => [
        styles.row,
        selected && { backgroundColor: theme.backgroundSelected },
        pressed && styles.pressed,
      ]}>
      <ModelIcon source={model.icon} size={32} selected={selected} locked={locked} />
      <ThemedView style={styles.rowText}>
        <View style={styles.titleRow}>
          <ThemedText type="smallBold">{model.label}</ThemedText>
          {model.isPremium && <PremiumBadge />}
        </View>
        {locked ? (
          <ThemedText type="small" themeColor="textSecondary">
            登录解锁
          </ThemedText>
        ) : model.description ? (
          <ThemedText
            type="small"
            themeColor="textSecondary"
            numberOfLines={selected ? 2 : 1}>
            {model.description}
          </ThemedText>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            标准额度
          </ThemedText>
        )}
      </ThemedView>
      {selected && (
        <SystemIcon name="check" size={18} weight="semibold" color={theme.text} />
      )}
    </Pressable>
  );
}

export function ModelPicker({
  value,
  onChange,
  isAuthenticated,
  disabled,
  onHistoryPress,
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
      <View style={styles.triggerRow}>
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
            {formatModelShortName(currentModel.modelId)}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={onHistoryPress}
          hitSlop={8}
          style={({ pressed }) => [
            styles.historyButton,
            pressed && styles.pressed,
          ]}>
          <Image
            source={require('@/assets/images/history.png')}
            style={styles.historyIcon}
            contentFit="contain"
          />
        </Pressable>
      </View>

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
                    <SystemIcon name="close" size={18} color={theme.textSecondary} />
                  </Pressable>
                </ThemedView>

                {!isAuthenticated && (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
                    登录后可使用 ChatGPT、Claude、Gemini、Grok 等更多模型
                  </ThemedText>
                )}

                <ScrollView bounces={false} style={styles.list}>
                  {MODEL_SECTIONS.map((section) => (
                    <ThemedView key={section.title} style={styles.section}>
                      <ThemedText
                        type="small"
                        themeColor="textSecondary"
                        style={styles.sectionTitle}>
                        {section.title}
                      </ThemedText>
                      {section.models.map((model) => (
                        <ModelRow
                          key={model.modelId}
                          model={model}
                          selected={model.modelId === value}
                          locked={!isAuthenticated && model.requiresAuth}
                          onSelect={handleSelect}
                        />
                      ))}
                    </ThemedView>
                  ))}
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
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  historyButton: {
    padding: Spacing.one,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyIcon: {
    width: 22,
    height: 22,
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
  section: {
    gap: Spacing.one,
    marginBottom: Spacing.three,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.half,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    minHeight: 50,
  },
  rowText: {
    flex: 1,
    gap: 2,
    backgroundColor: 'transparent',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
});
