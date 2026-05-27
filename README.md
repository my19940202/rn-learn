# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## AI Chat（DeepSeek）

项目包含第三个 Tab **Chat**，支持与 DeepSeek 对话。

1. 复制环境变量模板：

   ```bash
   cp .env.example .env
   ```

2. 在 `.env` 中填入你的 DeepSeek API Key：

   ```bash
   EXPO_PUBLIC_DEEPSEEK_API_KEY=sk-your-key-here
   ```

3. 重启 Expo（修改 `.env` 后必须重启 Metro）：

   ```bash
   npx expo start
   ```

4. 打开 **Chat** Tab，输入消息并发送。

可选环境变量：`EXPO_PUBLIC_DEEPSEEK_API_URL`、`EXPO_PUBLIC_DEEPSEEK_MODEL`。

> 注意：`EXPO_PUBLIC_*` 变量会打包进客户端，仅适合本地学习/开发。生产环境应通过后端代理转发 API 请求。

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
