import { NGA_Module, NGABBSScript } from "../core/app";

export const LinkAndQuoteModule: NGA_Module = {
  name: "LinkAndQuote",

  renderFormsFunc($el: HTMLElement, app: NGABBSScript) {
    // DirectLinkJump
    if (app.setting.normal.directLinkJump) {
      $el.querySelectorAll("a[onclick]").forEach((el) => {
        const onClickAttr = el.getAttribute("onclick");
        if (onClickAttr && onClickAttr.includes("showUrlAlert")) {
          el.removeAttribute("onclick");
          el.removeAttribute("onmouseover");
          el.removeAttribute("onmouseout");
        }
      });
    }

    // FoldQuote
    if (app.setting.normal.foldQuote) {
      // 自动折叠过长引用
      const foldHeight = (app.setting.advanced.foldQuoteHeight as number) || 300;
      $el.querySelectorAll(".postcontent .quote").forEach((el) => {
        const $quote = el as HTMLElement;
        if ($quote.offsetHeight > foldHeight) {
          const originalHeight = $quote.offsetHeight;
          $quote.classList.add("hld__quote-fold");

          const currentFoldHeight = $quote.offsetHeight;
          const percent = 100 - Math.floor((currentFoldHeight / originalHeight) * 100);

          const btnBox = document.createElement("div");
          btnBox.className = "hld__quote-box";

          const btn = document.createElement("button");
          btn.textContent = `查看全部 (剩余${percent}%)`;

          btn.addEventListener("click", () => {
            btnBox.remove();
            $quote.classList.remove("hld__quote-fold");
          });

          btnBox.appendChild(btn);
          $quote.appendChild(btnBox);
        }
      });

      // 折叠附件
      $el.querySelectorAll("h4.silver.subtitle").forEach((el) => {
        const h4 = el as HTMLElement;
        if (h4.innerHTML === "附件" && h4.nextElementSibling?.id.includes("postattach")) {
          const attachDiv = h4.nextElementSibling as HTMLElement;
          attachDiv.style.display = "none";

          const openBtn = document.createElement("button");
          openBtn.textContent = "显示附件";
          openBtn.style.margin = "5px 0";
          openBtn.addEventListener("click", () => {
            openBtn.remove();
            attachDiv.style.display = "block";
          });

          h4.insertAdjacentElement("afterend", openBtn);
        }
      });
    }
  },

  renderThreadsFunc($el: HTMLElement, app: NGABBSScript) {
    // LinkTargetBlank
    if (app.setting.normal.linkTargetBlank) {
      const topicLink = $el.querySelector(".topic") as HTMLAnchorElement;
      if (topicLink) {
        const href = topicLink.getAttribute("href");
        if (href) {
          topicLink.setAttribute("data-href", href);
          topicLink.setAttribute("href", "javascript:void(0)");
          topicLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(href);
          });
        }
      }
    }
  },

  style: `
    .hld__quote-fold { height: 150px; overflow: hidden; position: relative; }
    .hld__quote-box { padding: 10px; position: absolute; left: 0; right: 0; bottom: 0; background: #f2eddf; text-align: center; }
    .hld__excel-body .hld__quote-box { background: #FFF; }
  `
};
