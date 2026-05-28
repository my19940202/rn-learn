# AI Link — MVP 文档（精简版）

## 1. 产品定位

线下分享获客工具：帮用户在一款 App 内统一访问海外大模型，解决国内访问不便的问题。  
MVP 阶段不正式上架，通过 TestFlight / 内测包线下分发。

**目标用户**：参加分享会的技术人、职场人，有 AI 提效需求。

---

## 2. MVP 范围

### 做

| 模块 | 说明 |
|------|------|
| 用户体系 | 注册、登录、退出 |
| 对话 | 多轮聊天、流式输出、Markdown 渲染 |
| 模型切换 | 对话内切换不同模型（DeepSeek / GPT / Claude 等） |
| 语音输入 | 按住说话 → 转文字 → 填入输入框（iOS 优先） |

### 不做（后续迭代）

- 微信一键登录、手机号验证码
- 会员 / 用量计费、云端对话同步
- 对话列表 / 历史持久化（MVP 可只做当前会话）
- 语音输出（TTS）、多模态、图片理解

---

## 3. 功能说明

### 3.1 用户体系

**注册**

- 邮箱或手机号 + 密码
- 同意用户协议（已有 `/explore/user-agreement` 页面）
- 注册成功后自动登录

**登录**

- 邮箱/手机号 + 密码
- 登录态持久化（SecureStore 存 token）

**退出**

- 「我的」页提供退出按钮，清除本地 token，跳转登录页

**路由守卫**

- 未登录：只能访问登录 / 注册页
- 已登录：可访问 Home、Chat、「我的」

> UI 骨架已在 `src/app/explore/index.tsx`，需接入后端 Auth API。

### 3.2 对话界面（Vercel AI SDK）

**技术选型**

- 客户端：`@ai-sdk/react` 的 `useChat`
- 传输层：`DefaultChatTransport` + `expo/fetch`（Expo 52+ 支持流式）
- Polyfill：根布局引入 `structuredClone`、`TextEncoderStream` 等（非 Web 平台）
- 后端：独立 API Route（Cloudflare Workers / Next.js 等），API Key 仅存服务端

**客户端示例结构**

```tsx
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';

const { messages, sendMessage, status, error } = useChat({
  transport: new DefaultChatTransport({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: `${API_BASE}/api/chat`,
    headers: { Authorization: `Bearer ${token}` },
  }),
});
```

**后端 `/api/chat`**

- 接收 `messages` + `model` 参数
- 用 AI SDK `streamText` 转发到对应 Provider
- 返回 UI Message Stream

**对话能力（MVP）**

- 多轮上下文
- 流式输出（打字机效果）
- Markdown 渲染（已有 `react-native-markdown-display`）
- 发送中禁用输入、错误提示、重试

> 当前 `src/app/chat.tsx` 使用手写 `streamChat`（DeepSeek 直连），MVP 需迁移到 AI SDK + 后端代理。

### 3.3 模型切换

**交互**

- Chat 页顶部下拉或 Picker，展示可用模型列表
- 切换后新消息走新模型，当前会话上下文保留

**MVP 模型列表（示例）**

| 显示名 | Provider | Model ID |
|--------|----------|----------|
| DeepSeek | deepseek | deepseek-chat |
| GPT-4o | openai | gpt-4o |
| Claude | anthropic | claude-sonnet-4-20250514 |

**实现要点**

- 客户端：`selectedModel` 状态，随 `sendMessage` 传给后端
- 后端：根据 `model` 字段选择 Provider，统一走 AI SDK

### 3.4 语音输入

**方案**：`expo-speech-recognition`（iOS 使用本地 `SFSpeechRecognizer`，无需第三方 STT 费用）

**交互**

- 输入框旁麦克风按钮：按住录音，松手结束
- 识别结果写入输入框，用户可编辑后发送
- 识别中显示波形 / 「正在听…」

**配置**

```json
// app.json plugins
["expo-speech-recognition", {
  "microphonePermission": "需要麦克风权限以进行语音输入",
  "speechRecognitionPermission": "需要语音识别权限"
}]
```

**注意**

- 需 Dev Client / 原生构建，Expo Go 不可用
- iOS 建议开启 `requiresOnDeviceRecognition: true`（仅麦克风权限，离线识别）
- Android 13+ 支持较好；MVP 可先保证 iOS，Android 后续补齐

---

## 4. 页面结构

```
App
├── (auth)                    # 未登录
│   ├── login                 # 登录（当前 explore/index.tsx）
│   └── register              # 注册
└── (tabs)                    # 已登录
    ├── index                 # Home（模型快捷入口）
    ├── chat                  # 对话（模型切换 + 语音 + useChat）
    └── profile               # 我的（用户信息 + 退出）
```

**主流程**

1. 打开 App → 检查 token → 未登录则进登录页
2. 登录成功 → 进入 Home 或 Chat
3. Chat 页选模型 → 文字 / 语音输入 → 流式看回复
4. 「我的」→ 退出 → 回登录页

---

## 5. 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | Expo 54 + Expo Router + React Native |
| 样式 | 现有 Themed 组件（后续可加 NativeWind） |
| 对话 | Vercel AI SDK（`ai` + `@ai-sdk/react`） |
| 流式 fetch | `expo/fetch` |
| 语音 | `expo-speech-recognition` |
| 登录态 | `expo-secure-store` + Context / Zustand |
| 后端 | Cloudflare Workers 或 Next.js API（待定） |

**依赖（待安装）**

```bash
pnpm add ai @ai-sdk/react @ai-sdk/openai @ai-sdk/anthropic
pnpm add expo-speech-recognition expo-secure-store
```

---

## 6. 开发优先级

### P0 — 必须先有

1. **Auth 后端 + 客户端**：注册 / 登录 / 退出 / 路由守卫
2. **Chat 后端**：`/api/chat` + AI SDK `streamText`
3. **Chat 前端迁移**：`useChat` + `expo/fetch` + 现有 UI 组件复用

### P1 — MVP 完整体验

4. **模型切换**：Picker + 后端多 Provider
5. **语音输入**：iOS `expo-speech-recognition` 集成到 `ChatInput`

### P2 — 可延后

6. 对话历史本地存储
7. Android 语音兼容与测试
8. 会员 / 用量 / 云端同步

---

## 7. 非功能性要求

- **安全**：API Key 仅在后端，客户端只带用户 token
- **性能**：流式首字 < 2s（取决于模型与网络）
- **合规**：App 内展示免责声明；仅限线下小范围分发

---

## 8. 当前代码状态

| 模块 | 状态 |
|------|------|
| Tab 导航（Home / Chat / 我的） | ✅ 已有 |
| Chat UI + Markdown | ✅ 已有 |
| DeepSeek 直连流式 | ✅ 已有（待替换为 AI SDK） |
| 登录页 UI | ✅ 骨架（explore/index.tsx） |
| 用户协议页 | ✅ 已有 |
| Auth 逻辑 | ❌ 待做 |
| AI SDK + 后端 | ❌ 待做 |
| 模型切换 | ❌ 待做 |
| 语音输入 | ❌ 待做 |

---

## 9. 后续扩展

- 对话列表与本地 / 云端同步
- 语音对话（TTS 播报）
- 会员额度与支付
- 多模态（图片上传）
