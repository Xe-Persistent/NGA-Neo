import { Storage } from "./storage";
import { MODULE_SETTINGS } from "../../config/settings";

export interface PluginSetting {
  type?: "normal" | "advanced";
  key: string;
  default?: unknown;
  title?: string;
  desc?: string;
  menu?: "left" | "right";
  extra?: {
    mode?: "fold" | "expand";
    id?: string;
    label?: string;
  };
  options?: Array<{ label: string; value: string | number }>;
}

export interface NGA_Module {
  name: string;
  title?: string;
  version?: string;
  type?: "plugin" | "core";
  setting?: PluginSetting;
  settings?: PluginSetting[];
  style?: string;

  preProcFunc?: (app: NGABBSScript) => void;
  initFunc?: (app: NGABBSScript) => void;
  postProcFunc?: (app: NGABBSScript) => void;
  renderAlwaysFunc?: (app: NGABBSScript) => void;
  renderThreadsFunc?: ($el: HTMLElement, app: NGABBSScript) => void;
  renderFormsFunc?: ($el: HTMLElement, app: NGABBSScript) => void;
  asyncStyle?: (app: NGABBSScript) => string;
}

export class NGABBSScript {
  public modules: NGA_Module[] = [];
  public style: string = "";
  public setting: {
    original: PluginSetting[];
    normal: Record<string, unknown>;
    advanced: Record<string, unknown>;
  } = {
    original: [],
    normal: {},
    advanced: {}
  };
  private readonly settingKeys = new Set<string>();

  constructor() {
    this.addSettings(MODULE_SETTINGS);
  }

  /**
   * 打印控制台消息
   */
  printLog(msg: string) {
    console.log(
      `%cNGA%cScript%c ${msg}`,
      "background: #222;color: #fff;font-weight:bold;padding:2px 2px 2px 4px;border-radius:4px 0 0 4px;",
      "background: #fe9a00;color: #000;font-weight:bold;padding:2px 4px 2px 2px;border-radius:0px 4px 4px 0px;",
      "background:none;color:#000;"
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

    if (module.setting) this.addSetting(module.setting);
    if (module.settings) this.addSettings(module.settings);

    if (module.style) this.style += module.style;

    this.modules.push(module);
  }

  private addSetting(setting: PluginSetting) {
    if (!setting.key || this.settingKeys.has(setting.key)) return;
    const type = setting.type || "normal";
    this.setting[type][setting.key] = setting.default ?? "";
    this.setting.original.push(setting);
    this.settingKeys.add(setting.key);
  }

  private addSettings(settings: readonly PluginSetting[]) {
    settings.forEach((setting) => this.addSetting(setting));
  }

  /**
   * 获取特定模块
   */
  getModule(name: string): NGA_Module | null {
    return this.modules.find((m) => m.name === name) || null;
  }

  async loadSetting() {
    const normalStr = await Storage.get<string>("hld__NGA_setting");
    if (normalStr) {
      try {
        const localSetting = JSON.parse(normalStr) as Record<string, unknown>;
        this.setting.normal = this.mergeKnownSettings("normal", localSetting);
      } catch (e) {
        console.error("Failed to parse normal setting", e);
      }
    }

    const advStr = await Storage.get<string>("hld__NGA_advanced_setting");
    if (advStr) {
      try {
        const localAdv = JSON.parse(advStr) as Record<string, unknown>;
        this.setting.advanced = this.mergeKnownSettings("advanced", localAdv);
      } catch (e) {
        console.error("Failed to parse advanced setting", e);
      }
    }
  }

  private mergeKnownSettings(type: "normal" | "advanced", localSetting: Record<string, unknown>) {
    const merged = { ...this.setting[type] };
    Object.entries(localSetting).forEach(([key, value]) => {
      if (key in merged) {
        merged[key] = value;
      }
    });
    return merged;
  }

  async init() {
    this.printLog("Initializing...");
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

    // Async Styles
    for (const module of this.modules) {
      if (module.asyncStyle) {
        try {
          this.style += module.asyncStyle(this);
        } catch {
          this.printLog(`[${module.name}] asyncStyle error`);
        }
      }
    }

    if (this.style) {
      const styleEl = document.createElement("style");
      styleEl.textContent = this.style;
      document.head.appendChild(styleEl);
    }
  }

  isThreads() {
    return document.getElementById("m_threads") !== null;
  }

  isForms() {
    return document.getElementById("m_posts") !== null;
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
    const threadRows = document.querySelectorAll(".topicrow:not([hld-threads-render='ok'])");
    threadRows.forEach((row) => {
      const el = row as HTMLElement;
      for (const module of this.modules) {
        try {
          module.renderThreadsFunc?.(el, this);
        } catch (error) {
          console.error(`[${module.name}] renderThreads error`, error);
        }
      }
      el.setAttribute("hld-threads-render", "ok");
    });
  }

  renderForms() {
    const postBoxes = document.querySelectorAll(".forumbox.postbox:not([hld-forms-render='ok'])");
    postBoxes.forEach((box) => {
      const el = box as HTMLElement;
      if (!el.querySelector(".small_colored_text_btn")) return;
      for (const module of this.modules) {
        try {
          module.renderFormsFunc?.(el, this);
        } catch (error) {
          console.error(`[${module.name}] renderForms error`, error);
        }
      }
      el.setAttribute("hld-forms-render", "ok");
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
