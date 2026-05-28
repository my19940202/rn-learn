import { Picker } from '@react-native-picker/picker';
import { Platform, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AVAILABLE_MODELS } from '@/constants/models';
import { Spacing } from '@/constants/theme';

type ModelPickerProps = {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
};

export function ModelPicker({ value, onChange, disabled }: ModelPickerProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        模型
      </ThemedText>
      <Picker
        enabled={!disabled}
        selectedValue={value}
        onValueChange={onChange}
        style={styles.picker}
        itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}>
        {AVAILABLE_MODELS.map((model) => (
          <Picker.Item key={model.modelId} label={model.label} value={model.modelId} />
        ))}
      </Picker>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  label: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  picker: {
    height: Platform.OS === 'ios' ? 120 : 48,
  },
  pickerItem: {
    fontSize: 16,
  },
});
