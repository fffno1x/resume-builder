import type { KeywordStyleRule } from "../types/resume";

export type KeywordToken = {
  text: string;
  rule: KeywordStyleRule | null;
};

export function tokenizeKeywordStyles(text: string, rules: KeywordStyleRule[]): KeywordToken[] {
  const activeRules = rules
    .map((rule, index) => ({ rule, index }))
    .filter(({ rule }) => rule.keyword.length > 0)
    .sort((left, right) => right.rule.keyword.length - left.rule.keyword.length || left.index - right.index);

  if (!text || activeRules.length === 0) return [{ text, rule: null }];

  const tokens: KeywordToken[] = [];
  let plainText = "";
  let position = 0;

  const flushPlainText = () => {
    if (!plainText) return;
    tokens.push({ text: plainText, rule: null });
    plainText = "";
  };

  while (position < text.length) {
    const match = activeRules.find(({ rule }) => text.startsWith(rule.keyword, position));
    if (!match) {
      plainText += text[position];
      position += 1;
      continue;
    }

    flushPlainText();
    tokens.push({ text: match.rule.keyword, rule: match.rule });
    position += match.rule.keyword.length;
  }

  flushPlainText();
  return tokens;
}
