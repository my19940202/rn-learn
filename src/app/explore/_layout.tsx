import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: '我的' }} />
      <Stack.Screen name="register" options={{ title: '注册', headerBackTitle: '' }} />
      <Stack.Screen
        name="user-agreement"
        options={{
          title: '用户协议',
          headerBackTitle: ''
        }}
      />
    </Stack>
  );
}
