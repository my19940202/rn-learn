import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolView } from 'expo-symbols';
import { type StyleProp, type ViewStyle } from 'react-native';

type SystemIconName =
  | 'close'
  | 'check'
  | 'copy'
  | 'chevron-down'
  | 'chevron-right'
  | 'lock'
  | 'chat-bubble'
  | 'edit';

const SF_SYMBOL: Record<SystemIconName, string> = {
  close: 'xmark',
  check: 'checkmark',
  copy: 'doc.on.doc',
  'chevron-down': 'chevron.down',
  'chevron-right': 'chevron.right',
  lock: 'lock.fill',
  'chat-bubble': 'bubble.left.and.bubble.right',
  edit: 'pencil',
};

const MATERIAL: Record<SystemIconName, keyof typeof MaterialIcons.glyphMap> = {
  close: 'close',
  check: 'check',
  copy: 'content-copy',
  'chevron-down': 'expand-more',
  'chevron-right': 'chevron-right',
  lock: 'lock',
  'chat-bubble': 'chat-bubble',
  edit: 'edit',
};

type SystemIconProps = {
  name: SystemIconName;
  size?: number;
  color: string;
  weight?: 'regular' | 'semibold' | 'bold';
  style?: StyleProp<ViewStyle>;
};

export function SystemIcon({ name, size = 18, color, weight, style }: SystemIconProps) {
  const fallback = (
    <MaterialIcons name={MATERIAL[name]} size={size} color={color} style={style as never} />
  );

  return (
    <SymbolView
      name={SF_SYMBOL[name] as never}
      size={size}
      weight={weight}
      tintColor={color}
      style={style}
      fallback={fallback}
    />
  );
}
