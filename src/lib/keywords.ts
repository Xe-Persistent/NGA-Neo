/**
 * 关键字匹配 —— 以 / 开头且形如 /pattern/flags 的关键字按正则处理，其余按纯文本包含匹配
 */
const REGEX_KEYWORD = /^\/(.*)\/([gimsuy]*)$/;

export const isKeywordHits = (keyword: string, text: string): boolean => {
  if (keyword.startsWith('/')) {
    const matchRegKeyword = keyword.match(REGEX_KEYWORD);
    const pattern = matchRegKeyword?.[1];
    if (pattern !== undefined) {
      try {
        return new RegExp(pattern, matchRegKeyword?.[2] ?? '').test(text);
      } catch {
        return false;
      }
    }
  }
  return text.includes(keyword);
};
