import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

const tabIcons = {
  home: require('../../assets/images/tabIcons/home.png'),
  chat: require('../../assets/images/tabIcons/chat.png'),
  user: require('../../assets/images/tabIcons/user.png'),
} as const;

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" androidSrc={tabIcons.home} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chat">
        <Label>Chat</Label>
        <Icon sf="bubble.left.and.bubble.right.fill" androidSrc={tabIcons.chat} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <Label>我的</Label>
        <Icon sf="person.fill" androidSrc={tabIcons.user} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
