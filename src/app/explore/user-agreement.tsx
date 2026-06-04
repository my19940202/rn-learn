import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

const AGREEMENT_SECTIONS = [
  {
    title: '一、服务说明',
    content:
      'AI Link 为用户提供海外大模型统一访问入口，本应用仅供个人合法学习与研究，不构成任何专业咨询或商业承诺。',
  },
  {
    title: '二、账号与安全',
    content:
      '您应妥善保管账号与密码，不得将账号借予他人使用。因账号泄露、共享或弱密码导致的损失，由用户自行承担。',
  },
  {
    title: '三、数据跨境传输',
    content:
      '为完成 AI 对话，您的输入内容、模型回复及相关请求元数据可能通过境外服务器或海外 API 提供商传输与处理。不同地区的数据保护规则可能存在差异，请您在发送敏感信息前充分评估数据出境风险。',
  },
  {
    title: '四、API Key 与合规责任',
    content:
      '若您使用自有或第三方 API Key，您须确保 Key 来源合法、用途合规，并自行承担 Key 的保管、轮换与泄露风险。因 Key 违规使用、被封禁、额度耗尽或服务方策略变更导致的不可用，由用户自行承担。',
  },
  {
    title: '五、服务可用性',
    content:
      '本服务依赖第三方模型与网络环境，我们不保证服务长期、持续、无中断可用。官方或上游平台可能调整策略、限制访问或封禁 Key，届时相关功能可能暂时或永久不可用。',
  },
  {
    title: '六、信息收集原则',
    content:
      '我们遵循最小必要原则，仅收集提供服务所必需的信息（如账号、额度与基础使用记录）。我们不会额外索取与服务无关的手机号、实名信息或其他敏感资料，除非法律法规另有要求。',
  },
  {
    title: '七、使用规范',
    content:
      '请勿利用本服务从事违法、侵权、危害网络安全或违反第三方平台规则的行为。我们保留在发现违规使用时限制、暂停或终止服务的权利。',
  },
  {
    title: '八、隐私保护',
    content:
      '我们仅在提供服务所必需的范围内处理您的信息。对话记录默认保存在本地，除非您主动开启云端同步功能。请勿在对话中提交身份证号、银行卡号、密码等高度敏感信息。',
  },
  {
    title: '九、免责声明',
    content:
      'AI 生成内容仅供参考，不构成法律、医疗、金融或其他专业建议。用户应自行判断内容准确性，并对使用结果负责。因用户违反法律法规、第三方条款或不当使用本服务而产生的数据泄露、账号封禁、纠纷或损失，开发者不承担数据安全与法律责任。',
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
            最后更新：2026 年 6 月
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
