import { Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { NativeTabIcon } from '@/components/native-tab-icon';
import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colorScheme = scheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      iconColor={colors.textSecondary}
      tintColor={colors.text}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <NativeTabIcon androidDrawable="tab_ic_home" iosSf="house.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chat">
        <Label>Chat</Label>
        <NativeTabIcon
          androidDrawable="tab_ic_chat"
          iosSf="bubble.left.and.bubble.right.fill"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <Label>我的</Label>
        <NativeTabIcon androidDrawable="tab_ic_user" iosSf="person.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
