import { NGA_Module, NGABBSScript } from "../core/app";

export const StyleModule: NGA_Module = {
  name: "StyleModule",
  title: "基础样式注入",

  initFunc(app: NGABBSScript) {
    // 监听 storage 改变，动态刷新样式
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === "local") {
        if (changes["hld__NGA_setting"] || changes["hld__NGA_advanced_setting"]) {
          // 这里为了简化实现，提示刷新生效，或者在真实项目中可以动态卸载/挂载 style 节点
          app.printLog("Settings updated. Reload the page to apply changes.");
        }
      }
    });
  }
};
