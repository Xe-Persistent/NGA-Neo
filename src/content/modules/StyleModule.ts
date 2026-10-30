import type { NGA_Module, NGABBSScript } from '../core/app';

export const StyleModule: NGA_Module = {
  name: 'StyleModule',

  initFunc(app: NGABBSScript) {
    // 监听 storage 改变，动态刷新样式
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        if (changes['nga-setting'] || changes['nga-advanced-setting']) {
          // 这里为了简化实现，提示刷新生效，或者在真实项目中可以动态卸载/挂载 style 节点
          app.printLog('Settings updated. Reload the page to apply changes.');
        }
      }
    });
  },
};
