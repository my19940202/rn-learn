import * as secureStorage from '@/utils/secure-storage';

const GUEST_CHAT_COUNT_KEY = 'guest_chat_count';

export async function getGuestChatCount(): Promise<number> {
  const raw = await secureStorage.getItem(GUEST_CHAT_COUNT_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export async function incrementGuestChatCount(): Promise<number> {
  const next = (await getGuestChatCount()) + 1;
  await secureStorage.setItem(GUEST_CHAT_COUNT_KEY, String(next));
  return next;
}

export async function clearGuestChatCount(): Promise<void> {
  await secureStorage.deleteItem(GUEST_CHAT_COUNT_KEY);
}
