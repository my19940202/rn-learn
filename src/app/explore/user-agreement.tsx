import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

const AGREEMENT_SECTIONS = [
  {
    title: '一、服务说明',
    content:
      'AI Link 为用户提供海外大模型统一访问入口。本应用仅限线下分享会参与者使用，请遵守相关法律法规及平台使用规范。',
  },
  {
    title: '二、账号与安全',
    content:
      '您应妥善保管账号与密码，不得将账号借予他人使用。因账号泄露导致的损失，由用户自行承担。',
  },
  {
    title: '三、使用规范',
    content:
      '请勿利用本服务从事违法、侵权或危害网络安全的行为。我们保留在发现违规使用时限制或终止服务的权利。',
  },
  {
    title: '四、隐私保护',
    content:
      '我们仅在提供服务所必需的范围内收集和使用您的信息。对话记录默认保存在本地，除非您主动开启云端同步功能。',
  },
  {
    title: '五、免责声明',
    content:
      'AI 生成内容仅供参考，不构成专业建议。用户应自行判断内容准确性，并对使用结果负责。',
  },
];

export default function UserAgreementScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.updated}>
            最后更新：2026 年 5 月
          </ThemedText>

          {AGREEMENT_SECTIONS.map((section) => (
            <ThemedView key={section.title} style={styles.section}>
              <ThemedText type="smallBold">{section.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.paragraph}>
                {section.content}
              </ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  updated: {
    marginBottom: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  paragraph: {
    lineHeight: 22,
  },
});
