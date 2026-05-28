import {
  HttpChatTransport,
  type HttpChatTransportInitOptions,
  type UIMessage,
  type UIMessageChunk,
} from 'ai';

function createTextId() {
  return `text-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 将后端 OpenAI 兼容 SSE 流转换为 AI SDK UIMessageChunk 流
 */
export class OpenAISSEChatTransport extends HttpChatTransport<UIMessage> {
  constructor(options: HttpChatTransportInitOptions<UIMessage> = {}) {
    super(options);
  }

  protected processResponseStream(
    stream: ReadableStream<Uint8Array>,
  ): ReadableStream<UIMessageChunk> {
    const decoder = new TextDecoder();
    let buffer = '';
    const textId = createTextId();
    let started = false;

    return new ReadableStream<UIMessageChunk>({
      async start(controller) {
        const reader = stream.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split('\n\n');
            buffer = events.pop() ?? '';

            for (const eventText of events) {
              for (const rawLine of eventText.split('\n')) {
                const line = rawLine.trimStart();
                if (!line.startsWith('data:')) continue;

                const data = line.slice(5).trim();
                if (!data || data === '[DONE]') continue;

                try {
                  const json = JSON.parse(data) as {
                    choices?: Array<{ delta?: { content?: string } }>;
                  };
                  const delta = json.choices?.[0]?.delta?.content;
                  if (!delta) continue;

                  if (!started) {
                    controller.enqueue({ type: 'start' });
                    controller.enqueue({ type: 'text-start', id: textId });
                    started = true;
                  }

                  controller.enqueue({ type: 'text-delta', id: textId, delta });
                } catch {
                  // 跳过无法解析的行
                }
              }
            }
          }

          if (started) {
            controller.enqueue({ type: 'text-end', id: textId });
          }
          controller.enqueue({ type: 'finish' });
          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });
  }
}
