import { NGA_Module, NGABBSScript } from "../core/app";

export const DomainRedirectModule: NGA_Module = {
  name: "DomainRedirect",
  title: "强制域名重定向",

  initFunc(app: NGABBSScript) {
    const target = app.setting.advanced.domainRedirectTarget as string;
    if (target && window.location.host !== target) {
      const newUrl = window.location.href.replace(window.location.host, target);
      window.location.replace(newUrl);
    }
  }
};
