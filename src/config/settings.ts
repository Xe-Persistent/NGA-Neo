export interface NormalSettings {
  hideAvatar: boolean;
  hideSmile: boolean;
  hideImage: boolean;
  hideSign: boolean;
  hideHeader: boolean;
  imgResize: boolean;
  imgEnhance: boolean;
  excelMode: boolean;
  authorMark: boolean;
  autoPage: boolean;
  userEnhance: boolean;
  markAndBan: boolean;
  directLinkJump: boolean;
  foldQuote: boolean;
  linkTargetBlank: boolean;
  keywordsBlock: boolean;
}

export interface AdvancedSettings {
  imgResizeWidth: number;
  hideCustomBg: boolean;
  kwdBlockContent: 'ALL' | 'TITLE' | 'BODY';
  domainRedirectTarget: string;
  excelTheme: 'tencent' | 'wps' | 'office';
  excelNoMode: boolean;
  excelTitle: string;
  foldQuoteHeight: number;
  authorMarkColor: string;
  banStrictMode: 'HIDE' | 'REMOVE' | 'ALL';
}

export interface AppSettings {
  normal: NormalSettings;
  advanced: AdvancedSettings;
}

export interface PluginSetting {
  key: string;
  default: unknown;
  title: string;
  desc?: string;
  extra?: {
    mode?: 'fold' | 'expand';
    id?: string;
    label?: string;
  };
  options?: Array<{ label: string; value: string | number }>;
}

export const normalSettings: PluginSetting[] = [
  {
    key: 'hideAvatar',
    default: false,
    title: '隐藏头像',
  },
  {
    key: 'hideSmile',
    default: false,
    title: '隐藏表情',
  },
  {
    key: 'hideImage',
    default: false,
    title: '隐藏贴内图片',
  },
  {
    key: 'hideSign',
    default: true,
    title: '隐藏签名',
  },
  {
    key: 'hideHeader',
    default: true,
    title: '隐藏版头/版规/子版入口',
  },
  {
    key: 'imgResize',
    default: true,
    title: '贴内图片缩放',
  },
  {
    key: 'imgEnhance',
    default: true,
    title: '贴内图片功能增强',
  },
  {
    key: 'excelMode',
    default: false,
    title: 'Excel模式',
  },
  {
    key: 'authorMark',
    default: true,
    title: '高亮楼主',
  },
  {
    key: 'autoPage',
    default: true,
    title: '自动翻页',
  },
  {
    key: 'userEnhance',
    default: true,
    title: '用户增强',
    desc: '显示用户的注册时间与发帖时的IP属地',
  },
  {
    key: 'markAndBan',
    default: true,
    title: '标记与拉黑',
    desc: '允许在楼层右上角对用户进行标记备注或拉黑屏蔽',
  },
  {
    key: 'directLinkJump',
    default: true,
    title: '外部链接直达',
    desc: '点击帖子中的外部链接时不再显示中转确认页，而是直接跳转',
  },
  {
    key: 'foldQuote',
    default: true,
    title: '自动折叠长引用',
  },
  {
    key: 'linkTargetBlank',
    default: false,
    title: '论坛列表新窗口打开',
  },
  {
    key: 'keywordsBlock',
    default: true,
    title: '关键字屏蔽',
  },
];

export const advancedSettings: PluginSetting[] = [
  {
    key: 'imgResizeWidth',
    default: 200,
    title: '图片缩放宽度',
    desc: '贴内图片缩放的宽度，高度自适应，单位px',
  },
  {
    key: 'hideCustomBg',
    default: true,
    title: '隐藏背景图片',
    desc: '选中时: 隐藏版头的同时顶部背景图片\n取消时: 无操作',
  },
  {
    key: 'kwdBlockContent',
    default: 'ALL',
    options: [
      { label: '标题与正文', value: 'ALL' },
      { label: '仅标题', value: 'TITLE' },
      { label: '仅正文', value: 'BODY' },
    ],
    title: '关键字屏蔽方式',
  },
  {
    key: 'domainRedirectTarget',
    default: '',
    options: [
      { label: '不重定向', value: '' },
      { label: 'bbs.nga.cn', value: 'bbs.nga.cn' },
      { label: 'ngabbs.com', value: 'ngabbs.com' },
      { label: 'nga.178.com', value: 'nga.178.com' },
    ],
    title: '强制域名重定向',
    desc: '如果你遇到跨域未登录问题，可配置强制跳回你常用的域名。',
  },
  {
    key: 'excelTheme',
    default: 'tencent',
    options: [
      { label: '腾讯文档', value: 'tencent' },
      { label: 'WPS', value: 'wps' },
      { label: 'Office', value: 'office' },
    ],
    title: 'Excel皮肤',
    desc: 'Excel的皮肤\n腾讯文档是矢量图形绘制，适应各种分辨率，不会失真，推荐优先使用\nWPS与Office为图片拼接而成，分辨率为1080P，高于此分辨率可能会失真',
  },
  {
    key: 'excelNoMode',
    default: false,
    title: 'Excel左列序号',
    desc: 'Excel最左列的显示序号，此策略为尽可能的更像Excel\n选中时: Excel最左栏为从1开始往下，逐行+1\n取消时: Excel最左栏为原始的回帖数\n*此功能仅在贴列表有效',
  },
  {
    key: 'excelTitle',
    default: '工作簿1',
    title: 'Excel覆盖标题',
    desc: 'Excel模式下标签栏的名称, 如留空, 则显示原始标题',
  },
  {
    key: 'foldQuoteHeight',
    default: 300,
    title: '自动折叠引用高度',
    desc: '自动折叠引用的高度阈值，单位为像素(px)',
  },
  {
    key: 'authorMarkColor',
    default: '#F00',
    title: '标记楼主颜色',
    desc: '标记楼主中的[楼主]的背景颜色',
  },
  {
    key: 'banStrictMode',
    default: 'HIDE',
    options: [
      { label: '屏蔽', value: 'HIDE' },
      { label: '删除', value: 'REMOVE' },
      { label: '全部删除', value: 'ALL' },
    ],
    title: '拉黑模式',
    desc: '此配置表示拉黑某人后对帖子的屏蔽策略\n屏蔽: 保留楼层\n删除: 将会删除楼层\n全部删除: 回复被拉黑用户的回复也会被删除',
  },
];
