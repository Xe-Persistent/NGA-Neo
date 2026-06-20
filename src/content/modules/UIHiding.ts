import { NGA_Module, NGABBSScript } from "../core/app";
import { normalSettings, advancedSettings } from "../../config/settings";

const uiKeys = [
  "hideAvatar",
  "hideSmile",
  "hideImage",
  "hideSign",
  "hideHeader",
  "imgResize",
  "imgResizeWidth",
  "hideCustomBg"
];

const moduleSettings = [...normalSettings, ...advancedSettings].filter((s) =>
  uiKeys.includes(s.key)
);

export const UIHidingModule: NGA_Module = {
  name: "UIHiding",
  title: "界面元素隐藏控制",
  settings: moduleSettings,

  renderAlwaysFunc(app: NGABBSScript) {
    // 隐藏版头
    if (
      app.setting.normal["hideHeader"] &&
      document.getElementById("hld__switch_header") === null
    ) {
      const toppedTopic = document.getElementById("toppedtopic");
      if (toppedTopic) {
        toppedTopic.style.display = "none";
        const subForums = document.getElementById("sub_forums");
        if (subForums) subForums.style.display = "none";

        const toggleHeaderBtn = document.createElement("button");
        toggleHeaderBtn.style.position = "absolute";
        toggleHeaderBtn.style.right = "16px";
        toggleHeaderBtn.id = "hld__switch_header";
        toggleHeaderBtn.textContent = "切换显示版头";
        toggleHeaderBtn.addEventListener("click", () => {
          if (toppedTopic.style.display === "none") {
            toppedTopic.style.display = "";
            if (subForums) subForums.style.display = "";
          } else {
            toppedTopic.style.display = "none";
            if (subForums) subForums.style.display = "none";
          }
        });

        const topTopicsH3 = document.querySelector("#toptopics > div > h3");
        if (topTopicsH3) topTopicsH3.appendChild(toggleHeaderBtn);
      }
    }

    if (app.setting.normal["hideHeader"] && app.setting.advanced["hideCustomBg"]) {
      const customBg = document.getElementById("custombg");
      if (customBg) customBg.style.display = "none";
      const mainMenu = document.getElementById("mainmenu");
      if (mainMenu) mainMenu.style.margin = "0px";
    }
  },

  renderFormsFunc($el: HTMLElement, app: NGABBSScript) {
    // 隐藏头像
    if (app.setting.normal["hideAvatar"]) {
      const avatars = $el.querySelectorAll(".avatar, .avatar+img");
      avatars.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
      const c1 = $el.querySelectorAll(".c1");
      c1.forEach((el) => {
        (el as HTMLElement).style.backgroundImage = "none";
      });
    }

    // 隐藏表情
    const c2Images = $el.querySelectorAll(".c2 img");
    c2Images.forEach((imgEl) => {
      const img = imgEl as HTMLImageElement;
      const classStr = img.className || "";

      // 处理表情
      if (classStr.includes("smile") && img.style.display !== "none") {
        const alt = img.getAttribute("alt") || "";
        const altSpan = document.createElement("span");
        altSpan.className = "smile_alt_text";
        altSpan.textContent = `[${alt}]`;

        if (app.setting.normal["hideSmile"]) {
          img.style.display = "none";
        } else {
          altSpan.style.display = "none";
        }
        img.parentNode?.insertBefore(altSpan, img.nextSibling);
      }

      // 处理贴内普通图片缩放与隐藏
      if (!classStr.includes("smile")) {
        if (app.setting.normal["imgResize"]) {
          img.classList.add("hld__img-resize");
          img.setAttribute("hld-img-resize", "ok");
          img.setAttribute("title", "点击大图显示");
        }

        if (img.style.display !== "none") {
          img.classList.add("hld__img-postimg");
          const src = img.getAttribute("src") || "";
          img.setAttribute("src", src.replace(".medium.jpg", ""));
          img.setAttribute("hld-hideimg", "ok");

          const imgBtn = document.createElement("button");
          imgBtn.className = "switch-img";
          imgBtn.style.display = "none";
          imgBtn.textContent = "图";
          imgBtn.addEventListener("click", () => {
            if (img.style.display === "none") {
              img.style.display = "";
              imgBtn.textContent = "隐藏";
            } else {
              img.style.display = "none";
              imgBtn.textContent = "图";
            }
          });

          if (app.setting.normal["hideImage"]) {
            img.style.display = "none";
            imgBtn.style.display = "";
          }
          img.parentNode?.insertBefore(imgBtn, img.nextSibling);
        }
      }
    });

    // 隐藏签名
    if (app.setting.normal["hideSign"]) {
      const signs = $el.querySelectorAll(".sign, .sigline");
      signs.forEach((el) => {
        (el as HTMLElement).style.display = "none";
      });
    }
  },

  asyncStyle(app: NGABBSScript) {
    let css = "";
    if (app.setting.normal["hideAvatar"]) {
      css += `.posterinfo .avatar+img {display: none;}`;
    }

    if (app.setting.normal["imgResize"]) {
      const width = app.setting.advanced["imgResizeWidth"] || 200;
      css += `
        .hld__img-resize {
          outline: none !important;
          outline-offset: '';
          cursor: alias;
          min-width: auto !important;
          min-height: auto !important;
          max-width: ${width}px !important;
          max-height: none !important;
          margin: 5px;
        }
      `;
    }

    if (app.setting.normal["hideHeader"]) {
      css += `
        #m_threads .toptopicsRight {float:none;width:auto;}
        .topicrowsLeftC {margin-right:0;}
      `;
    }

    return css;
  }
};
