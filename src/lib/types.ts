/**
 * 共享数据类型定义
 */

/** 用户标记标签 */
export interface UserMark {
  mark: string;
  text_color: string;
  bg_color: string;
  desc?: string;
}

/** 被拉黑的用户 */
export interface BanUser {
  uid: string;
  name: string;
  desc?: string;
}

/** 被标记的用户 */
export interface MarkUser {
  uid: string;
  name: string;
  marks: UserMark[];
}

/** 标签使用历史统计 */
export interface TagStats {
  mark: string;
  text_color: string;
  bg_color: string;
  desc?: string;
  count: number;
}
