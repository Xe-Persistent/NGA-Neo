/**
 * 共享数据解析器 — 用于解析 chrome.storage 中存储的 JSON 数据
 */
import { isRecord, readString, parseJson } from './guards';
import type { BanUser, MarkUser } from './types';

/** UID 统一转成字符串，兼容手工编辑配置时写入数字的情况 */
const readUid = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
};

/** 解析黑名单列表 */
export const parseBanList = (value: unknown): BanUser[] => {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter(isRecord)
    .map((item) => ({
      uid: readUid(item.uid),
      name: readString(item.name).trim(),
      desc: readString(item.desc) || undefined,
    }))
    .filter((item) => item.uid || item.name);
};

/** 解析标记用户列表 */
export const parseMarkList = (value: unknown): MarkUser[] => {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter(isRecord)
    .map((item) => {
      const marksRaw = Array.isArray(item.marks) ? item.marks : [];
      const marks = marksRaw
        .filter(isRecord)
        .map((mark) => ({
          mark: readString(mark.mark),
          text_color: readString(mark.text_color) || '#000',
          bg_color: readString(mark.bg_color) || '#ffd966',
          desc: readString(mark.desc) || undefined,
        }))
        .filter((mark) => mark.mark);

      return {
        uid: readUid(item.uid),
        name: readString(item.name).trim(),
        marks,
      };
    })
    .filter((item) => (item.uid || item.name) && item.marks.length > 0);
};

/** 解析屏蔽关键字列表 */
export const parseKeywordsList = (value: unknown): string[] => {
  const parsed = parseJson(value);
  if (Array.isArray(parsed)) {
    return parsed.filter((item): item is string => typeof item === 'string');
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};
