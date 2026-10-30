import type { NGA_Module, NGABBSScript } from '../core/app';

export const DomainRedirectModule: NGA_Module = {
  name: 'DomainRedirect',

  initFunc(app: NGABBSScript) {
    const target = app.setting.advanced.domainRedirectTarget;
    if (target && window.location.host !== target) {
      const newUrl = window.location.href.replace(window.location.host, target);
      window.location.replace(newUrl);
    }
  },
};
