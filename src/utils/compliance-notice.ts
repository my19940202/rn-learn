import * as secureStorage from '@/utils/secure-storage';

const CHAT_COMPLIANCE_NOTICE_KEY = 'chat_compliance_notice_seen';

export async function hasSeenChatComplianceNotice(): Promise<boolean> {
  const raw = await secureStorage.getItem(CHAT_COMPLIANCE_NOTICE_KEY);
  return raw === '1';
}

export async function markChatComplianceNoticeSeen(): Promise<void> {
  await secureStorage.setItem(CHAT_COMPLIANCE_NOTICE_KEY, '1');
}
