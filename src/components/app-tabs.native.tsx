import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform, useColorScheme } from 'react-native';

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
        {Platform.OS === 'android' ? (
          <Icon drawable="tab_ic_home" />
        ) : (
          <Icon sf="house.fill" />
        )}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chat">
        <Label>Chat</Label>
        {Platform.OS === 'android' ? (
          <Icon drawable="tab_ic_chat" />
        ) : (
          <Icon sf="bubble.left.and.bubble.right.fill" />
        )}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <Label>我的</Label>
        {Platform.OS === 'android' ? (
          <Icon drawable="tab_ic_user" />
        ) : (
          <Icon sf="person.fill" />
        )}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
