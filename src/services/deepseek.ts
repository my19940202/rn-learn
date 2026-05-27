export type ChatMessage = {
    id?: string;
    role: "user" | "assistant" | "system";
    content: string;
};

const DEEPSEEK_API_URL =
    process.env.EXPO_PUBLIC_DEEPSEEK_API_URL ??
    "https://api.deepseek.com/chat/completions";

const DEEPSEEK_MODEL =
    process.env.EXPO_PUBLIC_DEEPSEEK_MODEL ?? "deepseek-chat";

const DEFAULT_TEMPERATURE = 0.7;

const SYSTEM_PROMPT =
    "你是一个有帮助的 AI 助手，请用简洁清晰的中文回答用户问题。";

export function getDeepSeekApiKey(): string | undefined {
    return process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
}

export function isDeepSeekConfigured(): boolean {
    return Boolean(getDeepSeekApiKey());
}

function buildRequestMessages(messages: ChatMessage[]): ChatMessage[] {
    const hasSystem = messages.some((m) => m.role === "system");
    return hasSystem
        ? messages
        : [{ role: "system", content: SYSTEM_PROMPT }, ...messages];
}

export async function streamChat(
    messages: ChatMessage[],
    onDelta: (chunk: string) => void,
    signal?: AbortSignal,
): Promise<void> {
    const apiKey = getDeepSeekApiKey();
    if (!apiKey) {
        throw new Error("未设置 EXPO_PUBLIC_DEEPSEEK_API_KEY 环境变量");
    }

    const requestMessages = buildRequestMessages(messages);

    const res = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: requestMessages,
            stream: true,
            temperature: DEFAULT_TEMPERATURE,
        }),
        signal,
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
            `DeepSeek API ${res.status}: ${errorText.slice(0, 500)}`,
        );
    }

    // React Native 环境下，使用 .text() 获取完整响应文本
    const responseText = await res.text();
    const lines = responseText.split("\n");

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") break;

        try {
            const json = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
            };
            const delta = json.choices?.[0]?.delta?.content;
            if (delta !== undefined && delta !== null) {
                onDelta(delta);
            }
        } catch {
            // 跳过无法解析的行
        }
    }
}

export async function sendChat(messages: ChatMessage[]): Promise<string> {
    let content = "";
    await streamChat(messages, (chunk) => {
        content += chunk;
    });
    if (!content) {
        throw new Error("DeepSeek 流式响应未返回任何内容");
    }
    return content;
}
