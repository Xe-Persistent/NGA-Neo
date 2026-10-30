import { describe, expect, it } from 'vitest';
import { escapeHtml } from './html';

describe('escapeHtml', () => {
  it('转义 HTML 特殊字符', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
    expect(escapeHtml("it's & <b>")).toBe('it&#39;s &amp; &lt;b&gt;');
  });

  it('普通文本保持不变', () => {
    expect(escapeHtml('工作簿1')).toBe('工作簿1');
    expect(escapeHtml('')).toBe('');
  });
});
