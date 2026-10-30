import { Storage } from './storage';
import type { PluginSetting, AppSettings } from '@/config/settings';
import { normalSettings, advancedSettings } from '@/config/settings';

export interface NGA_Module {
  name: string;

  preProcFunc?: (app: NGABBSScript) => void;
  initFunc?: (app: NGABBSScript) => void;
  postProcFunc?: (app: NGABBSScript) => void;
  renderAlwaysFunc?: (app: NGABBSScript) => void;
  renderThreadsFunc?: ($el: HTMLElement, app: NGABBSScript) => void;
  renderFormsFunc?: ($el: HTMLElement, app: NGABBSScript) => void;
}

export class NGABBSScript {
  public modules: NGA_Module[] = [];
  public setting: AppSettings = {
    normal: {
      hideAvatar: false,
      hideSmile: false,
      hideImage: false,
      hideSign: true,
      hideHeader: true,
      imgResize: true,
      imgEnhance: true,
      excelMode: false,
      authorMark: true,
      autoPage: true,
      userEnhance: true,
      markAndBan: true,
      directLinkJump: true,
      foldQuote: true,
      linkTargetBlank: false,
      keywordsBlock: true,
    },
    advanced: {
      imgResizeWidth: 200,
      hideCustomBg: true,
      kwdBlockContent: 'ALL',
      domainRedirectTarget: '',
      excelTheme: 'tencent',
      excelNoMode: false,
      excelTitle: '工作簿1',
      foldQuoteHeight: 300,
      authorMarkColor: '#F00',
      banStrictMode: 'HIDE',
    },
  };
  private readonly settingKeys = new Set<string>();

  constructor() {
    this.addSettings(normalSettings, 'normal');
    this.addSettings(advancedSettings, 'advanced');
  }

  /**
   * 打印控制台消息
   */
  printLog(msg: string) {
    console.log(
      `%cNGA%cScript%c ${msg}`,
      'background: #222;color: #fff;font-weight:bold;padding:2px 2px 2px 4px;border-radius:4px 0 0 4px;',
      'background: #fe9a00;color: #000;font-weight:bold;padding:2px 4px 2px 2px;border-radius:0px 4px 4px 0px;',
      'background:none;color:#000;',
    );
  }

  /**
   * 注册模块
   */
  addModule(module: NGA_Module) {
    if (module.preProcFunc) {
      try {
        module.preProcFunc(this);
      } catch (error) {
        this.printLog(`[${module.name}] preProcFunc error`);
        console.error(error);
      }
    }
    this.modules.push(module);
  }

  private addSetting(setting: PluginSetting, type: 'normal' | 'advanced') {
    if (!setting.key || this.settingKeys.has(setting.key)) return;
    const target = this.setting[type] as unknown as Record<string, unknown>;
    target[setting.key] = setting.default ?? '';
    this.settingKeys.add(setting.key);
  }

  private addSettings(settings: readonly PluginSetting[], type: 'normal' | 'advanced') {
    settings.forEach((setting) => this.addSetting(setting, type));
  }

  /**
   * 获取特定模块
   */
  getModule(name: string): NGA_Module | null {
    return this.modules.find((m) => m.name === name) || null;
  }

  async loadSetting() {
    const normalStr = await Storage.get<string>('nga-setting');
    if (normalStr) {
      try {
        const localSetting = JSON.parse(normalStr) as Record<string, unknown>;
        this.setting.normal = this.mergeKnownSettings('normal', localSetting);
      } catch (e) {
        console.error('Failed to parse normal setting', e);
      }
    }

    const advStr = await Storage.get<string>('nga-advanced-setting');
    if (advStr) {
      try {
        const localAdv = JSON.parse(advStr) as Record<string, unknown>;
        this.setting.advanced = this.mergeKnownSettings('advanced', localAdv);
      } catch (e) {
        console.error('Failed to parse advanced setting', e);
      }
    }
  }

  private mergeKnownSettings<K extends 'normal' | 'advanced'>(
    type: K,
    localSetting: Record<string, unknown>,
  ): AppSettings[K] {
    const merged = { ...this.setting[type] } as unknown as Record<string, unknown>;
    Object.entries(localSetting).forEach(([key, value]) => {
      if (key in merged) {
        merged[key] = value;
      }
    });
    return merged as unknown as AppSettings[K];
  }

  async init() {
    this.printLog('Initializing...');
    await this.loadSetting();

    // Init Func
    for (const module of this.modules) {
      if (module.initFunc) {
        try {
          module.initFunc(this);
        } catch (error) {
          this.printLog(`[${module.name}] initFunc error`);
          console.error(error);
        }
      }
    }

    // Post Proc Func
    for (const module of this.modules) {
      if (module.postProcFunc) {
        try {
          module.postProcFunc(this);
        } catch (error) {
          this.printLog(`[${module.name}] postProcFunc error`);
          console.error(error);
        }
      }
    }
  }

  isThreads() {
    return document.getElementById('m_threads') !== null;
  }

  isForms() {
    return document.getElementById('m_posts') !== null;
  }

  renderAlways() {
    for (const module of this.modules) {
      try {
        module.renderAlwaysFunc?.(this);
      } catch (error) {
        console.error(`[${module.name}] renderAlways error`, error);
      }
    }
  }

  renderThreads() {
    const threadRows = document.querySelectorAll(".topicrow:not([nga-threads-render='ok'])");
    threadRows.forEach((row) => {
      const el = row as HTMLElement;
      for (const module of this.modules) {
        try {
          module.renderThreadsFunc?.(el, this);
        } catch (error) {
          console.error(`[${module.name}] renderThreads error`, error);
        }
      }
      el.setAttribute('nga-threads-render', 'ok');
    });
  }

  renderForms() {
    const postBoxes = document.querySelectorAll(".forumbox.postbox:not([nga-forms-render='ok'])");
    postBoxes.forEach((box) => {
      const el = box as HTMLElement;
      if (!el.querySelector('.small_colored_text_btn')) return;
      for (const module of this.modules) {
        try {
          module.renderFormsFunc?.(el, this);
        } catch (error) {
          console.error(`[${module.name}] renderForms error`, error);
        }
      }
      el.setAttribute('nga-forms-render', 'ok');
    });
  }

  async run() {
    await this.init();
    setInterval(() => {
      this.renderAlways();
      if (this.isThreads()) this.renderThreads();
      if (this.isForms()) this.renderForms();
    }, 100);
  }
}
