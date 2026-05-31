import { Icon } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

type NativeTabIconProps = {
  androidDrawable: string;
  iosSf:
    | 'house.fill'
    | 'bubble.left.and.bubble.right.fill'
    | 'person.fill';
};

/** Android release APK：drawable 比 require PNG 更稳定；iOS 使用 SF Symbol。 */
export function NativeTabIcon({ androidDrawable, iosSf }: NativeTabIconProps) {
  if (Platform.OS === 'android') {
    return <Icon drawable={androidDrawable} />;
  }
  return <Icon sf={iosSf} />;
}
