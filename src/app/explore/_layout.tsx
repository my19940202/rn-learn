import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="user-agreement" options={{ title: '用户协议' }} />
    </Stack>
  );
}
