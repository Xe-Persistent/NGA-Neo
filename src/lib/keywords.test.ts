import { describe, expect, it } from 'vitest';
import { isKeywordHits } from './keywords';

describe('isKeywordHits', () => {
  it('纯文本按包含匹配', () => {
    expect(isKeywordHits('广告', '这里有广告内容')).toBe(true);
    expect(isKeywordHits('广告', '正常内容')).toBe(false);
  });

  it('支持 /pattern/flags 正则', () => {
    expect(isKeywordHits('/广[告饭]/', '此处有广告')).toBe(true);
    expect(isKeywordHits('/ABC/i', 'abc')).toBe(true);
    expect(isKeywordHits('/^abc$/', 'xabcx')).toBe(false);
  });

  it('非法正则返回 false', () => {
    expect(isKeywordHits('/[unclosed/', 'unclosed')).toBe(false);
  });

  it('以 / 开头但不是完整正则时按纯文本处理', () => {
    expect(isKeywordHits('/foo', 'a /foo b')).toBe(true);
    expect(isKeywordHits('/foo', 'a foo b')).toBe(false);
  });
});
