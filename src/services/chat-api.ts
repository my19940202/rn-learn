import type { UIMessage } from 'ai';

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? 'https://chat.aizeten.me';

export function getChatApiUrl() {
  return `${API_BASE}/api/chat`;
}

export function getUserApiUrl() {
  return `${API_BASE}/api/user`;
}

export type PlanTier = 'free' | 'pro' | 'max';

export type PlanLimits = {
  daily_standard: number | null;
  monthly_standard: number | null;
  monthly_premium: number | null;
  unlimited: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatar_url?: string | null;
  created_at?: number;
  last_login_at?: number | null;
  plan_tier?: PlanTier;
  plan_status?: string;
  daily_standard_used?: number;
  monthly_standard_used?: number;
  monthly_premium_used?: number;
  credit?: number;
  limits?: PlanLimits;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `请求失败 (${res.status})`);
  }
  return data;
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(getUserApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', email, password }),
  });
  return parseJsonResponse<AuthResponse>(res);
}

export async function registerApi(
  email: string,
  password: string,
  name?: string,
): Promise<AuthResponse> {
  const res = await fetch(getUserApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'register', email, password, name }),
  });
  return parseJsonResponse<AuthResponse>(res);
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  const res = await fetch(getUserApiUrl(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await parseJsonResponse<{ user: AuthUser }>(res);
  return data.user;
}

export function resolveAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function uploadAvatar(token: string, uri: string): Promise<AuthUser> {
  const formData = new FormData();
  const fileName = uri.split('/').pop() || 'avatar.jpg';
  const mimeType = fileName.endsWith('.png')
    ? 'image/png'
    : fileName.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';

  formData.append('file', {
    uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const res = await fetch(`${getUserApiUrl()}/avatar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await parseJsonResponse<{ user: AuthUser }>(res);
  return data.user;
}

export async function updateProfileApi(
  token: string,
  payload: { name?: string; avatar_url?: string | null },
): Promise<AuthUser> {
  const res = await fetch(getUserApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: 'updateProfile',
      ...payload,
    }),
  });

  const data = await parseJsonResponse<{ user: AuthUser }>(res);
  return data.user;
}

export type Conversation = {
  id: string;
  title: string;
  model: string;
  created_at: number;
  updated_at: number;
};

export type ConversationMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: number;
};

export async function fetchConversations(token: string): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/api/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await parseJsonResponse<{ conversations: Conversation[] }>(res);
  return data.conversations;
}

export async function fetchConversationDetail(
  token: string,
  conversationId: string,
): Promise<{ conversation: Conversation; messages: ConversationMessage[] }> {
  const res = await fetch(`${API_BASE}/api/conversations/${conversationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonResponse<{ conversation: Conversation; messages: ConversationMessage[] }>(res);
}

export async function deleteConversation(token: string, conversationId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await parseJsonResponse<{ success: boolean }>(res);
}

export function uiMessagesToApiMessages(messages: UIMessage[]) {
  return messages
    .filter(
      (message) =>
        message.id !== 'welcome' &&
        (message.role === 'user' || message.role === 'assistant'),
    )
    .map((message) => ({
      role: message.role as 'user' | 'assistant',
      content: message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join(''),
    }))
    .filter((message) => message.content.trim().length > 0);
}
