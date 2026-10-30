import { describe, expect, it } from 'vitest';
import { isRecord, normalizeName, parseJson, readString } from './guards';

describe('isRecord', () => {
  it('识别普通对象与数组', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
    expect(isRecord([])).toBe(true);
  });

  it('拒绝 null 与原始类型', () => {
    expect(isRecord(null)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
    expect(isRecord('str')).toBe(false);
    expect(isRecord(42)).toBe(false);
  });
});

describe('readString', () => {
  it('只接受字符串', () => {
    expect(readString('abc')).toBe('abc');
    expect(readString(1)).toBe('');
    expect(readString(undefined)).toBe('');
  });
});

describe('parseJson', () => {
  it('解析合法 JSON 字符串', () => {
    expect(parseJson('{"a":1}')).toEqual({ a: 1 });
    expect(parseJson('[1,2]')).toEqual([1, 2]);
  });

  it('解析失败或非字符串返回 null', () => {
    expect(parseJson('{bad json')).toBeNull();
    expect(parseJson({ a: 1 })).toBeNull();
    expect(parseJson(null)).toBeNull();
  });
});

describe('normalizeName', () => {
  it('去掉方括号与末尾的“楼主”', () => {
    expect(normalizeName('[某用户]')).toBe('某用户');
    expect(normalizeName('某用户楼主')).toBe('某用户');
    expect(normalizeName(' 某用户 ')).toBe('某用户');
  });
});
