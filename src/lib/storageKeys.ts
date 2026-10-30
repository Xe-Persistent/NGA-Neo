/**
 * chrome.storage.local 中使用的键名，content script 与 popup 共用
 */
export const STORAGE_KEYS = [
  'nga-setting',
  'nga-advanced-setting',
  'nga-ban-list',
  'nga-mark-list',
  'nga-keywords-list',
] as const;

export type StorageKey = (typeof STORAGE_KEYS)[number];
