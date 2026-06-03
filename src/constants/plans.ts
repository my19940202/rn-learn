export type PlanTier = 'free' | 'pro' | 'max';

export type PlanLimits = {
  daily_standard: number | null;
  monthly_standard: number | null;
  monthly_premium: number | null;
  unlimited: boolean;
};

export type PlanDefinition = {
  tier: PlanTier;
  name: string;
  price: string;
  priceNote?: string;
  accentColor: string;
  standardQuota: string;
  premiumQuota?: string;
  standardModels: string[];
  premiumModels?: string[];
};

export const PLANS: PlanDefinition[] = [
  {
    tier: 'free',
    name: 'Free',
    price: '¥0',
    accentColor: '#9CA3AF',
    standardQuota: '每日 10 次访问普通模型',
    standardModels: ['Gemini 3 Flash', 'GPT-5.4 mini', 'Claude 4.5 Haiku'],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '¥19.9/月',
    priceNote: '扫码联系管理员开通',
    accentColor: '#208AEF',
    standardQuota: '每月 2,000 次访问普通模型',
    premiumQuota: '每月 100 次访问高级模型',
    standardModels: ['Gemini 3 Flash', 'GPT-5.4 mini', 'Claude 4.5 Haiku'],
    premiumModels: ['GPT-5.5', 'Claude 4.6 Sonnet', 'Gemini 3.1 Pro'],
  },
  {
    tier: 'max',
    name: 'Max',
    price: '¥49.9/月',
    priceNote: '扫码联系管理员开通',
    accentColor: '#FFCC33',
    standardQuota: '无限访问普通模型',
    premiumQuota: '无限访问高级模型',
    standardModels: ['Gemini 3 Flash', 'GPT-5.4 mini', 'Claude 4.5 Haiku'],
    premiumModels: ['GPT-5.5', 'Claude 4.6 Sonnet', 'Gemini 3.1 Pro'],
  },
];

export function getPlanByTier(tier: PlanTier): PlanDefinition {
  return PLANS.find((plan) => plan.tier === tier) ?? PLANS[0];
}

export function formatCreatedAt(timestamp?: number | null): string {
  if (!timestamp) return '未知';
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatQuotaUsage(
  tier: PlanTier,
  usage: {
    daily_standard_used: number;
    monthly_standard_used: number;
    monthly_premium_used: number;
  },
  limits: PlanLimits,
): string {
  if (limits.unlimited) {
    return '当前套餐不限量';
  }

  if (tier === 'free') {
    const cap = limits.daily_standard ?? 10;
    return `今日普通模型：${usage.daily_standard_used}/${cap}`;
  }

  const standardCap = limits.monthly_standard ?? 0;
  const premiumCap = limits.monthly_premium ?? 0;
  return `本月普通：${usage.monthly_standard_used}/${standardCap} · 高级：${usage.monthly_premium_used}/${premiumCap}`;
}
