import { describe, expect, it } from 'vitest';
import { parseBanList, parseKeywordsList, parseMarkList } from './parsers';

describe('parseBanList', () => {
  it('解析黑名单并丢弃无效项', () => {
    const raw = JSON.stringify([
      { uid: '123', name: '甲', desc: '备注' },
      { uid: '', name: '乙' },
      { uid: 1, name: '丙' },
      { foo: 'bar' },
      'not-an-object',
    ]);

    expect(parseBanList(raw)).toEqual([
      { uid: '123', name: '甲', desc: '备注' },
      { uid: '', name: '乙', desc: undefined },
      { uid: '1', name: '丙', desc: undefined },
    ]);
  });

  it('非法输入返回空数组', () => {
    expect(parseBanList(null)).toEqual([]);
    expect(parseBanList('not json')).toEqual([]);
    expect(parseBanList('{"uid":"1"}')).toEqual([]);
  });
});

describe('parseMarkList', () => {
  it('解析标记名单并补全默认颜色', () => {
    const raw = JSON.stringify([
      {
        uid: '1',
        name: '甲',
        marks: [
          { mark: '大佬' },
          { mark: '', text_color: '#fff' },
          { mark: '水友', bg_color: '#000' },
        ],
      },
      { uid: '2', name: '乙', marks: [] },
    ]);

    expect(parseMarkList(raw)).toEqual([
      {
        uid: '1',
        name: '甲',
        marks: [
          { mark: '大佬', text_color: '#000', bg_color: '#ffd966', desc: undefined },
          { mark: '水友', text_color: '#000', bg_color: '#000', desc: undefined },
        ],
      },
    ]);
  });

  it('非法输入返回空数组', () => {
    expect(parseMarkList(undefined)).toEqual([]);
    expect(parseMarkList('[]')).toEqual([]);
  });
});

describe('parseKeywordsList', () => {
  it('解析 JSON 数组', () => {
    expect(parseKeywordsList(JSON.stringify(['广告', '/正则/i']))).toEqual(['广告', '/正则/i']);
  });

  it('兼容旧的逗号分隔字符串', () => {
    expect(parseKeywordsList('广告, 水贴 ,,')).toEqual(['广告', '水贴']);
  });

  it('丢弃非字符串成员', () => {
    expect(parseKeywordsList(JSON.stringify(['a', 1, null]))).toEqual(['a']);
  });
});
