import { StyleSheet } from 'react-native';
import type { MarkdownProps } from 'react-native-markdown-display';

import { Colors, Fonts } from '@/constants/theme';

type Theme = (typeof Colors)['light'];

export function createMarkdownStyles(theme: Theme): MarkdownProps['style'] {
  return StyleSheet.create({
    body: {
      color: theme.text,
      fontSize: 14,
      lineHeight: 22,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 8,
    },
    heading1: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 8,
    },
    heading2: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 6,
    },
    heading3: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    bullet_list: {
      marginBottom: 8,
    },
    ordered_list: {
      marginBottom: 8,
    },
    list_item: {
      marginBottom: 4,
    },
    code_inline: {
      backgroundColor: theme.backgroundSelected,
      color: theme.text,
      fontFamily: Fonts.mono,
      fontSize: 13,
      paddingHorizontal: 4,
      borderRadius: 4,
    },
    fence: {
      backgroundColor: theme.backgroundSelected,
      color: theme.text,
      fontFamily: Fonts.mono,
      fontSize: 13,
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
    },
    blockquote: {
      backgroundColor: theme.backgroundElement,
      borderLeftColor: theme.textSecondary,
      borderLeftWidth: 3,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginVertical: 8,
    },
    link: {
      color: '#3c87f7',
    },
    hr: {
      backgroundColor: theme.backgroundSelected,
      height: StyleSheet.hairlineWidth,
      marginVertical: 12,
    },
    table: {
      borderColor: theme.backgroundSelected,
      marginVertical: 8,
    },
    thead: {
      backgroundColor: theme.backgroundElement,
    },
    th: {
      color: theme.text,
      padding: 8,
    },
    td: {
      color: theme.text,
      padding: 8,
    },
  }) as MarkdownProps['style'];
}
