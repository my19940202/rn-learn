export type ModelOption = {
  label: string;
  provider: string;
  modelId: string;
};

export const AVAILABLE_MODELS: ModelOption[] = [
  { label: 'DeepSeek', provider: 'deepseek', modelId: 'deepseek/deepseek-chat' },
  { label: 'GPT-4o', provider: 'openai', modelId: 'openai/gpt-4.1-mini' },
  { label: 'Claude', provider: 'anthropic', modelId: 'anthropic/claude-3-5-sonnet-latest' },
];

export const DEFAULT_MODEL = AVAILABLE_MODELS[1].modelId;
