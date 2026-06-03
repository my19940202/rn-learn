import type { ImageSourcePropType } from 'react-native';

export const PREMIUM_ACCENT = '#FFCC33';

export type ModelOption = {
  label: string;
  provider: string;
  modelId: string;
  icon: ImageSourcePropType;
  requiresAuth: boolean;
  isPremium?: boolean;
  description?: string;
};

export const AVAILABLE_MODELS: ModelOption[] = [
  // 普通模型
  {
    label: 'Gemini',
    provider: 'google',
    modelId: 'google/gemini-3-flash',
    icon: require('@/assets/images/tabIcons/gemini.png'),
    requiresAuth: true,
  },
  {
    label: 'ChatGPT',
    provider: 'openai',
    modelId: 'openai/gpt-5.4-mini',
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
  // 高级模型
  {
    label: 'GPT-5.5',
    provider: 'openai',
    modelId: 'openai/gpt-5.5',
    icon: require('@/assets/images/tabIcons/chatgpt.png'),
    requiresAuth: true,
    isPremium: true,
    description: '更强推理与长上下文',
  },
  {
    label: 'Claude Sonnet',
    provider: 'anthropic',
    modelId: 'anthropic/claude-sonnet-4.6',
    icon: require('@/assets/images/tabIcons/claude.png'),
    requiresAuth: true,
    isPremium: true,
    description: '复杂任务与代码',
  },
  {
    label: 'Gemini Pro',
    provider: 'google',
    modelId: 'google/gemini-3.1-pro',
    icon: require('@/assets/images/tabIcons/gemini.png'),
    requiresAuth: true,
    isPremium: true,
    description: '多模态与深度分析',
  },
  {
    label: 'Grok',
    provider: 'xai',
    modelId: 'xai/grok-4.3',
    icon: require('@/assets/images/tabIcons/grok.png'),
    requiresAuth: true,
    isPremium: true,
    description: '限制少，内容无审查（不限制色情、暴力、政治等敏感内容）',
  },
];

export const GUEST_MODEL = AVAILABLE_MODELS[0].modelId;
export const LOGGED_IN_DEFAULT_MODEL = AVAILABLE_MODELS[1].modelId;

/** @deprecated use LOGGED_IN_DEFAULT_MODEL or GUEST_MODEL */
export const DEFAULT_MODEL = LOGGED_IN_DEFAULT_MODEL;

export function formatModelShortName(modelId: string): string {
  const slash = modelId.indexOf('/');
  return slash >= 0 ? modelId.slice(slash + 1) : modelId;
}

export function getModelById(modelId: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((model) => model.modelId === modelId);
}

export function getModelLabel(modelId: string): string {
  return getModelById(modelId)?.label ?? modelId;
}

export function getModelIcon(modelId: string): ImageSourcePropType {
  return getModelById(modelId)?.icon ?? AVAILABLE_MODELS[0].icon;
}
