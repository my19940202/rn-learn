export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const DEEPSEEK_API_URL =
  process.env.EXPO_PUBLIC_DEEPSEEK_API_URL ?? 'https://api.deepseek.com/chat/completions';

const DEEPSEEK_MODEL = process.env.EXPO_PUBLIC_DEEPSEEK_MODEL ?? 'deepseek-chat';

const DEFAULT_TEMPERATURE = 0.7;

const SYSTEM_PROMPT = '你是一个有帮助的 AI 助手，请用简洁清晰的中文回答用户问题。';

export function getDeepSeekApiKey(): string | undefined {
  return process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
}

export function isDeepSeekConfigured(): boolean {
  return Boolean(getDeepSeekApiKey());
}

export async function sendChat(messages: ChatMessage[]): Promise<string> {
  const apiKey = getDeepSeekApiKey();
  if (!apiKey) {
    throw new Error('未设置 EXPO_PUBLIC_DEEPSEEK_API_KEY 环境变量');
  }

  const hasSystem = messages.some((m) => m.role === 'system');
  const requestMessages: ChatMessage[] = hasSystem
    ? messages
    : [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];

  const res = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: requestMessages,
      stream: false,
      temperature: DEFAULT_TEMPERATURE,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`DeepSeek API ${res.status}: ${JSON.stringify(body).slice(0, 500)}`);
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('DeepSeek 响应缺少 choices[0].message.content');
  }

  return content;
}
