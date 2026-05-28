import type { UIMessage } from 'ai';

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? 'https://chat.aizeten.me';

export function getChatApiUrl() {
  return `${API_BASE}/api/chat`;
}

export function getUserApiUrl() {
  return `${API_BASE}/api/user`;
}

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatar_url?: string | null;
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

export function uiMessagesToApiMessages(messages: UIMessage[]) {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role as 'user' | 'assistant',
      content: message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join(''),
    }))
    .filter((message) => message.content.trim().length > 0);
}
