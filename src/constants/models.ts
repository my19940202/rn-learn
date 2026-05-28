import type { ImageSourcePropType } from 'react-native';

export type ModelOption = {
  label: string;
  provider: string;
  modelId: string;
  icon: ImageSourcePropType;
  requiresAuth: boolean;
};

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    label: 'DeepSeek',
    provider: 'deepseek',
    modelId: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    icon: require('@/assets/images/tabIcons/deepseek.png'),
    requiresAuth: false,
  },
  {
    label: 'ChatGPT',
    provider: 'openai',
    modelId: 'openai/gpt-4',
    icon: require('@/assets/images/tabIcons/chatgpt.png'),
    requiresAuth: true,
  },
  {
    label: 'Claude',
    provider: 'anthropic',
    modelId: 'anthropic/claude-haiku-4.5',
    icon: require('@/assets/images/tabIcons/claude.png'),
    requiresAuth: true,
  },
  {
    label: 'Gemini',
    provider: 'google',
    modelId: 'google/gemini-2.5-flash',
    icon: require('@/assets/images/tabIcons/gemini.png'),
    requiresAuth: true,
  },
  {
    label: 'Grok',
    provider: 'x-ai',
    modelId: 'xai/grok-4.20-0309-reasoning',
    icon: require('@/assets/images/tabIcons/grok.png'),
    requiresAuth: true,
  },
];

export const GUEST_MODEL = AVAILABLE_MODELS[0].modelId;
export const LOGGED_IN_DEFAULT_MODEL = AVAILABLE_MODELS[1].modelId;

/** @deprecated use LOGGED_IN_DEFAULT_MODEL or GUEST_MODEL */
export const DEFAULT_MODEL = LOGGED_IN_DEFAULT_MODEL;

export function getModelById(modelId: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((model) => model.modelId === modelId);
}

export function getModelLabel(modelId: string): string {
  return getModelById(modelId)?.label ?? modelId;
}

export function getModelIcon(modelId: string): ImageSourcePropType {
  return getModelById(modelId)?.icon ?? AVAILABLE_MODELS[0].icon;
}
