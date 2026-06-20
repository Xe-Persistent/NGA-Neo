import { NGA_Module, NGABBSScript } from "../core/app";

let scrollListener: (() => void) | null = null;

export const AutoPageModule: NGA_Module = {
  name: "AutoPage",

  initFunc(app: NGABBSScript) {
    if (app.setting.normal.autoPage) {
      document.body.classList.add("hld__reply-fixed");
    }
  },

  renderAlwaysFunc(app: NGABBSScript) {
    if (!app.setting.normal.autoPage) return;

    if (document.getElementById("hld__next_page")) return;

    const pagebbtm = document.getElementById("pagebbtm");
    if (!pagebbtm) return;

    const stdbtns = pagebbtm.querySelectorAll('.stdbtn:not([hld-auto-page="ok"])');
    stdbtns.forEach((btn) => {
      const tds = btn.querySelectorAll("td");
      tds.forEach((td) => {
        const a = td.querySelector("a");
        if (a && a.textContent?.trim() === ">") {
          a.id = "hld__next_page";

          if (scrollListener) {
            window.removeEventListener("scroll", scrollListener);
          }

          scrollListener = () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (scrollTop !== 0 && Math.ceil(scrollTop) + windowHeight >= documentHeight - 20) {
              const nextBtn = document.getElementById("hld__next_page");
              if (nextBtn) {
                nextBtn.click();
                nextBtn.removeAttribute("id");
                if (scrollListener) {
                  window.removeEventListener("scroll", scrollListener);
                  scrollListener = null;
                }
              }
            }
          };

          window.addEventListener("scroll", scrollListener);
        }
      });
      btn.setAttribute("hld-auto-page", "ok");
    });
  }
};
