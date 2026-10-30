/**
 * 共享类型守卫与工具函数
 */

/** 判断值是否为非 null 对象 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** 安全读取字符串，非字符串返回空字符串 */
export const readString = (value: unknown): string => (typeof value === 'string' ? value : '');

/** 安全解析 JSON 字符串 */
export const parseJson = (value: unknown): unknown => {
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

/** 规范化用户名：去掉方括号和末尾的"楼主"字样 */
export const normalizeName = (name: string): string =>
  name.replace('[', '').replace(']', '').replace(/楼主$/, '').trim();
