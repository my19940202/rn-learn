import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ModelIconProps = {
  source: ImageSourcePropType;
  size?: number;
  selected?: boolean;
  locked?: boolean;
};

export function ModelIcon({ source, size = 28, selected, locked }: ModelIconProps) {
  const theme = useTheme();
  const containerSize = size + 8;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor: theme.backgroundElement,
          opacity: locked ? 0.45 : 1,
        },
        selected && { borderWidth: 2, borderColor: theme.text },
      ]}>
      <Image source={source} style={{ width: size, height: size }} contentFit="contain" />
      {locked && (
        <View style={[styles.lockBadge, { backgroundColor: theme.backgroundSelected }]}>
          <SymbolView
            name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
            size={10}
            tintColor={theme.textSecondary}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: Spacing.three,
    height: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
