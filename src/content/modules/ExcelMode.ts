import { NGA_Module, NGABBSScript } from "../core/app";
import { getExcelTheme, IMG_EXCEL_ICON } from "./ExcelThemeAssets";

let beforeUrl = window.location.href;

const enableExcelMode = (app: NGABBSScript) => {
  document.body.classList.add("hld__excel-body");
  if (!app.setting.advanced.excelNoMode) {
    document.body.classList.add("hld__excel-original-no");
  }
};

export const ExcelModeModule: NGA_Module = {
  name: "ExcelMode",

  async initFunc(app: NGABBSScript) {
    if (!app.setting.normal.excelMode) return;

    // 生成列标题字母列表。
    const columnLetters = () => {
      const capital: string[] = [];
      const columnLetters: string[] = [];
      for (let i = 65; i < 91; i++) capital.push(String.fromCharCode(i));
      ["", "A", "B", "C"].forEach((n) => capital.forEach((c) => columnLetters.push(`${n}${c}`)));
      return columnLetters;
    };

    const theme = (app.setting.advanced.excelTheme as string) || "wps";
    const excelTitle = (app.setting.advanced.excelTitle as string) || document.title;

    let headerHtml: string;
    let footerHtml: string;

    if (theme === "tencent") {
      headerHtml = `
      <div class="hld__excel-div hld__excel-header">
          <div class="hld__excel-titlebar">
              <div class="hld__excel-titlebar-content hld__excel-icon24" style="margin:2px 2px 2px 10px;background-image:url(${getExcelTheme(theme, "icon_1")});"></div>
              <div class="hld__excel-titlebar-content hld__excel-icon12" style="background-image:url(${getExcelTheme(theme, "icon_2")});"></div>
              <div style="height: 24px;border-right: 1px solid rgb(0, 0, 0);opacity: 0.06;margin: 0 12px;vertical-align: middle;"></div>
              <div class="hld__excel-titlebar-title"></div>
              <div class="hld__excel-titlebar-content hld__excel-icon16" style="margin-left: 10px;background-image:url(${getExcelTheme(theme, "icon_3")});"></div>
              <div class="hld__excel-titlebar-content hld__excel-icon16" style="margin-left: 12px;background-image:url(${getExcelTheme(theme, "icon_4")});"></div>
              <div class="hld__excel-titlebar-content hld__excel-icon16" style="margin-left: 10px;background-image:url(${getExcelTheme(theme, "icon_5")});"></div>
              <div style="margin-left: 5px;font-size: 12px;line-height: 20px;height: 18px;;color: #000;opacity: 0.48;font-weight:400;">上次修改是在2小时前进行的</div>
              <div style="flex-grow: 1;"></div>
              <div style="height: 24px;border-right: 1px solid rgb(0, 0, 0);opacity: 0.06;margin: 0 12px;vertical-align: middle;"></div>
              <div style="width:28px;height:28px;border-radius: 4px;background: #e9e9e9;text-align: center;line-height: 32px;">🐟︎</div>
          </div>
          <div class="hld__excel-toolbar">
              ${Array.from({ length: 4 }, (_, i) => '<div class="hld__excel-titlebar-content hld__excel-icon20" style="margin:0 6px;background-image:url(' + getExcelTheme(theme, "icon_" + (10 + i)) + ');"></div>').join("")}
              <div style="height: 16px;border-right: 1px solid rgb(0, 0, 0);opacity: 0.06;margin: 0 4px;vertical-align: middle;"></div>
              <div class="hld__excel-titlebar-content hld__excel-icon20" style="margin-left: 8px;background-image:url(${getExcelTheme(theme, "icon_14")});"></div>
              <div style="padding: 0 2px;">插入</div>
              <div class="hld__excel-titlebar-content hld__excel-icon12" style="background-image:url(${getExcelTheme(theme, "icon_2")});"></div>
              <div style="height: 16px;border-right: 1px solid rgb(0, 0, 0);opacity: 0.06;margin: 0 8px;vertical-align: middle;"></div>
              <div style="padding: 0 30px 0 4px;">常规</div>
              <div class="hld__excel-titlebar-content hld__excel-icon12" style="background-image:url(${getExcelTheme(theme, "icon_2")});"></div>
              <div class="hld__excel-titlebar-content hld__excel-icon20" style="margin-left: 12px;background-image:url(${getExcelTheme(theme, "icon_15")});"></div>
              <div style="margin-left: 1px;">
                  <div class="hld__excel-titlebar-content hld__excel-icon12" style="transform: rotate(180deg);background-image:url(${getExcelTheme(theme, "icon_2")});"></div>
                  <div class="hld__excel-titlebar-content hld__excel-icon12" style="background-image:url(${getExcelTheme(theme, "icon_2")});"></div>
              </div>
              <div style="height: 16px;border-right: 1px solid #000;opacity: 0.06;margin: 0 4px;vertical-align: middle;"></div>
              <div style="padding: 0 4px 0 16px;">默认字体</div>
              <div class="hld__excel-titlebar-content hld__excel-icon12" style="background-image:url(${getExcelTheme(theme, "icon_2")});"></div>
              <div style="padding: 0 4px 0 13px;">10</div>
              <div class="hld__excel-titlebar-content hld__excel-icon12" style="background-image:url(${getExcelTheme(theme, "icon_2")});"></div>
              <div class="hld__excel-titlebar-content hld__excel-icon20" style="margin-left: 10px;background-image:url(${getExcelTheme(theme, "icon_16")});"></div>
              <div class="hld__excel-titlebar-pick">
                  <div class="hld__excel-titlebar-content hld__excel-icon20" style="background-image:url(${getExcelTheme(theme, "icon_17")});"></div>
                  <div class="hld__excel-titlebar-indication" style="background-color: #000;"></div>
              </div>
              <div class="hld__excel-titlebar-content hld__excel-icon12" style="margin-left: 4px;background-image:url(${getExcelTheme(theme, "icon_2")});"></div>
              <div class="hld__excel-titlebar-pick">
                  <div class="hld__excel-titlebar-content hld__excel-icon20" style="background-image:url(${getExcelTheme(theme, "icon_18")});"></div>
                  <div class="hld__excel-titlebar-indication" style="background-color: #8cddfa;"></div>
              </div>
              <div class="hld__excel-titlebar-content hld__excel-icon12" style="margin-left: 4px;background-image:url(${getExcelTheme(theme, "icon_2")});"></div>
              <div class="hld__excel-titlebar-content hld__excel-icon20" style="margin-left: 10px;background-image:url(${getExcelTheme(theme, "icon_19")});"></div>
              <div class="hld__excel-titlebar-content hld__excel-icon12" style="margin-left: 2px;background-image:url(${getExcelTheme(theme, "icon_2")});"></div>
              <div class="hld__excel-titlebar-content hld__excel-icon20" style="margin-left: 10px;background-image:url(${getExcelTheme(theme, "icon_20")});"></div>
              <div style="height: 16px;border-right: 1px solid #000;opacity: 0.06;margin: 0 10px;vertical-align: middle;"></div>
              ${Array.from({ length: 4 }, (_, i) => '<div class="hld__excel-titlebar-content hld__excel-icon20" style="background-image:url(' + getExcelTheme(theme, "icon_" + (21 + i)) + ');"></div><div class="hld__excel-titlebar-content hld__excel-icon12" style="margin-left: 2px;margin-right: ' + (i === 3 ? "0" : "10") + "px;background-image:url(" + getExcelTheme(theme, "icon_2") + ');"></div>').join("")}
              <div style="height: 16px;border-right: 1px solid #000;opacity: 0.06;margin: 0 10px;vertical-align: middle;"></div>
              <div class="hld__excel-titlebar-content hld__excel-icon20" style="background-image:url(${getExcelTheme(theme, "icon_25")});"></div>
              <div class="hld__excel-titlebar-content hld__excel-icon12" style="margin-left: 4px;background-image:url(${getExcelTheme(theme, "icon_2")});"></div>
              <div style="height: 16px;border-right: 1px solid #000;opacity: 0.06;margin: 0 10px;vertical-align: middle;"></div>
              ${Array.from({ length: 4 }, (_, i) => '<div class="hld__excel-titlebar-content hld__excel-icon20" style="background-image:url(' + getExcelTheme(theme, "icon_" + (26 + i)) + ');"></div><div class="hld__excel-titlebar-content hld__excel-icon12" style="margin-left: 2px;margin-right: ' + (i === 3 ? "0" : "10") + "px;background-image:url(" + getExcelTheme(theme, "icon_2") + ');"></div>').join("")}
              <div style="height: 16px;border-right: 1px solid #000;opacity: 0.06;margin: 0 10px;vertical-align: middle;"></div>
              <div class="hld__excel-titlebar-content hld__excel-icon20" style="margin-left: 10px;background-image:url(${getExcelTheme(theme, "icon_20")});"></div>
              <div style="flex-grow: 1;"></div>
          </div>
          <div class="hld__excel-formulabar">
              <div style="border-right: 1px solid #e0e2e4;color: #777;text-align: center;width: 50px;font-size: 12px;height: 25px;line-height: 25px;font-weight:400;">A1</div>
          </div>
          <div class="hld__excel-h4">
              <div class="hld__excel-sub"><div></div></div>
              ${columnLetters()
                .map((c) => '<div class="hld__excel-column">' + c + "</div>")
                .join("")}
          </div>
      </div>
      `;
      footerHtml = `
      <div class="hld__excel-div hld__excel-footer">
          <div class="hld__excel-icon24" style="margin-left: 10px;background-image:url(${getExcelTheme(theme, "icon_33")});"></div>
          <div class="hld__excel-icon24" style="margin-left: 10px;background-image:url(${getExcelTheme(theme, "icon_34")});"></div>
          <div class="hld__excel-sheet-tab">
              <div class="hld__excel-sheet-name">
                  <div>工作表1</div>
                  <div class="hld__excel-icon12" style="margin-left: 4px;background-image:url(${getExcelTheme(theme, "icon_2")});"></div>
              </div>
              <div class="hld__excel-sheet-underblock"></div>
          </div>
          <div style="flex-grow: 1;"></div>
          <div class="hld__excel-icon24" style="margin-left: 10px;background-image:url(${getExcelTheme(theme, "icon_35")});"></div>
          <div class="hld__excel-icon12" style="margin-left: 2px;background-image:url(${getExcelTheme(theme, "icon_2")});"></div>
          <div style="height: 16px;border-right: 1px solid #000;opacity: 0.12;margin: 0 10px;vertical-align: middle;"></div>
          <div class="hld__excel-icon24" style="background-image:url(${getExcelTheme(theme, "icon_36")});"></div>
          <div class="hld__excel-footer-item" style="font-size: 20px;margin-left:20px;">-</div>
          <div class="hld__excel-footer-item" style="font-weight: 400">100%</div>
          <div class="hld__excel-footer-item" style="font-size: 20px;">+</div>
          <div style="width:10px;"></div>
      </div>
      `;
    } else {
      headerHtml = `
      <div class="hld__excel-div hld__excel-header">
          <div class="hld__excel-h1">
              <div class="hld__excel-title">${excelTitle} - Excel</div>
              <img class="hld__excel-img-h1-l1" src="${getExcelTheme(theme, "H_L_1")}">
              <img class="hld__excel-img-h1-r1" src="${getExcelTheme(theme, "H_R_1")}">
          </div>
          <div class="hld__excel-h2">
              <img class="hld__excel-img-h2-l1" src="${getExcelTheme(theme, "H_L_2")}">
              <img class="hld__excel-img-h2-r1" src="${getExcelTheme(theme, "H_R_2")}">
          </div>
          <div class="hld__excel-h3">
              <img class="hld__excel-img-h3-l1" src="${getExcelTheme(theme, "H_L_3")}">
              <img class="hld__excel-img-h3-r1" src="${getExcelTheme(theme, "H_R_3")}">
              <div class="hld__excel-fx"></div>
          </div>
          <div class="hld__excel-h4">
              <div class="hld__excel-sub"><div></div></div>
              ${columnLetters()
                .map((c) => '<div class="hld__excel-column">' + c + "</div>")
                .join("")}
          </div>
      </div>
      `;
      footerHtml = `
      <div class="hld__excel-div hld__excel-footer">
          <div class="hld__excel-f1">
              <img class="hld__excel-img-f1-l1" src="${getExcelTheme(theme, "F_L_1")}">
              <img class="hld__excel-img-f1-r1" src="${getExcelTheme(theme, "F_R_1")}">
          </div>
          <div class="hld__excel-f2">
          <img class="hld__excel-img-fl2" src="${getExcelTheme(theme, "F_L_2")}">
          <img class="hld__excel-img-fr2" src="${getExcelTheme(theme, "F_R_2")}">
          </div>
      </div>
      `;
    }

    document.body.insertAdjacentHTML("beforeend", headerHtml);
    document.body.insertAdjacentHTML("beforeend", footerHtml);

    const settingBtn = document.getElementById("hld__excel_setting");
    if (settingBtn) {
      settingBtn.addEventListener("click", () => {
        const cover = document.getElementById("hld__setting_cover");
        if (cover) cover.style.display = "block";
      });
    }

    const halfMenu = document.querySelector("#mainmenu .half");
    if (halfMenu && halfMenu.parentElement) {
      const clone = halfMenu.cloneNode(true) as HTMLElement;
      clone.classList.add("hld__half-clone");
      clone.textContent = (halfMenu.textContent || "").replace("你好", "");
      halfMenu.parentElement.appendChild(clone);
    }

    if (app.setting.normal.excelMode) {
      if (beforeUrl && (beforeUrl.includes("thread.php") || beforeUrl.includes("read.php"))) {
        enableExcelMode(app);
      }
    }
  },

  renderAlwaysFunc(app: NGABBSScript) {
    const theme = app.setting.advanced.excelTheme || "tencent";
    const themeClass = `hld__excel-theme-${theme}`;
    if (!document.body.classList.contains(themeClass)) {
      document.body.classList.add(themeClass);
    }

    if (app.setting.normal.excelMode && window.location.href !== beforeUrl) {
      beforeUrl = window.location.href;
      if (beforeUrl.includes("thread.php") || beforeUrl.includes("read.php")) {
        if (!document.querySelector(".hld__excel-body")) {
          document.body.classList.add("hld__excel-body");
        }
      } else {
        if (document.querySelector(".hld__excel-body")) {
          document.body.classList.remove("hld__excel-body");
        }
      }
      if (!app.setting.advanced.excelNoMode) {
        document.body.classList.add("hld__excel-original-no");
      } else {
        document.body.classList.remove("hld__excel-original-no");
      }
    }

    if (
      app.setting.normal.excelMode &&
      document.querySelector(".hld__excel-body") &&
      !document.getElementById("mmc")
    ) {
      document.body.classList.add("hld__excel-body-err");
    } else {
      document.body.classList.remove("hld__excel-body-err");
    }

    // Excel Title
    if (document.querySelector(".hld__excel-body")) {
      const excelTitle = app.setting.advanced.excelTitle as string;
      if (excelTitle && document.title !== excelTitle) {
        document.title = excelTitle;
      }
      const titleEl = document.querySelector(".hld__excel-titlebar-title");
      if (titleEl) {
        titleEl.textContent = excelTitle || document.title;
      }
      if (!document.getElementById("hld__excel_icon")) {
        const link = document.createElement("link");
        link.id = "hld__excel_icon";
        link.rel = "shortcut icon";
        link.type = "image/png";
        link.href = IMG_EXCEL_ICON;
        document.head.appendChild(link);
      }
    }
  },

  renderFormsFunc($el: HTMLElement, app: NGABBSScript) {
    if (!app.setting.normal.excelMode) return;
    const tdFirst = $el.querySelector(".postrow > td:first-child");
    if (tdFirst) {
      tdFirst.insertAdjacentHTML("beforebegin", '<td class="c0"></td>');
    }
  },

  style: `
    /* WPS风格 */
    .hld__excel-body-err {padding-top: 200px}
    .hld__excel-header, .hld__excel-footer, .hld__excel-setting, .hld__half-clone {display: none;}
    .hld__excel-header>div, .hld__excel-footer>div {position: relative;box-sizing: border-box;}
    .hld__excel-header img, .hld__excel-footer img {position: absolute;}
    .hld__excel-header {border-bottom:1px solid #bbbbbb;}
    .hld__excel-title {display:none;}
    .hld__excel-h1 {height:30px;background:#f3f5f8;border-bottom:1px solid #c5cbd6;}
    .hld__excel-h2 {height:102px;background:#f4f4f4;}
    .hld__excel-img-h1-l1, .hld__excel-img-h2-l1, .hld__excel-img-f1-l1, .hld__excel-img-fl2 {top:0;left:0;}
    .hld__excel-img-h1-r1, .hld__excel-img-h2-r1, .hld__excel-img-f1-r1, .hld__excel-img-fr2 {top:0;right:0;}
    .hld__excel-h3 {height:44px;background:#e8e8e8;box-shadow: inset 0 3px 5px #d9d9d9;}
    .hld__excel-img-h3-l1 {top:12px;left:0;}
    .hld__excel-img-h3-r1 {toP:8px;right:0;}
    .hld__excel-fx {position: absolute;top:12px;left:253px;right:45px;height:24px;box-sizing: border-box;border:1px solid #cccccc;border-radius:4px;background:#ffffff;}
    .hld__excel-h4 {height:21px;display:flex;overflow: hidden;}
    .hld__excel-h4 > div {height:21px;border-right:1px solid #c8c8c8;box-sizing:border-box;flex-shrink: 0;}
    .hld__excel-sub {width:34px;position: relative;}
    .hld__excel-sub > div {position: absolute;right:4px;bottom:4px;width: 0px;height: 0px;border-top: 6px solid transparent;border-left: 6px solid transparent;border-right: 6px solid #b8b8b8;border-bottom: 6px solid #b8b8b8;}
    .hld__excel-column {width: 72px;line-height:21px;text-align:center;color:#444444;font-family: sans-serif;font-weight:100;font-size:14px;}
    .hld__excel-f1 {height:22px;background:#e8e8e8;}
    .hld__excel-f2 {height:28px;background:#f4f4f4;}
    .hld__excel-body {background:#fff !important;}
    .hld__excel-body #mainmenu {position: fixed;top: 5px;right: 75px;width: 425px;z-index: 98;}
    .hld__excel-body #mainmenu .right {float:none;}
    .hld__excel-body #mainmenu .stdbtn {background:none;box-shadow:none;}
    .hld__excel-body #mainmenu .half {display:none;}
    .hld__excel-body #mainmenu .hld__half-clone {display:block;width: 150px;text-align: right;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;}
    .hld__excel-body #mainmenu .half {color:#f4f4f4 !important;}
    .hld__excel-body #mainmenu .stdbtn a:hover {background:none;text-decoration:underline;color:#2c5787 !important;}
    .hld__excel-body #mainmenu .mmdefault.cell input {padding:0;margin:0;background:#ededed;border:1px solid #c9d0dc;border-radius:10px;box-shadow:none;font-size:13px !important;}
    .hld__excel-body #mainmenu, .hld__excel-body #mainmenu .half, .hld__excel-body #mainmenu td a, .hld__excel-body #mainmenu .stdbtn .innerbg, .hld__excel-body #mainmenu, .hld__excel-body #mainmenu .stdbtn a, .hld__excel-body #mainmenu .stdbtn .td {height: 20px !important;line-height: 20px !important;padding: 0 5px !important;background:none;color:#424242 !important;}
    .hld__excel-body #mainmenu .innerbg > div:nth-child(2) > div:first-child {display:none;}
    .hld__excel-body .single_ttip2 {position: fixed !important;z-index:999 !important;top:30px !important;border-color:#888;}
    .hld__excel-body .hld__excel-body #mainmenu, .hld__excel-body .catenew,.hld__excel-body #toptopics,.hld__excel-body #m_pbtntop,.hld__excel-body #m_fopts,.hld__excel-body #b_nav,.hld__excel-body #fast_post_c,.hld__excel-body #custombg,.hld__excel-body #m_threads th,.hld__excel-body #m_posts th,.hld__excel-body .r_container,.hld__excel-body #footer,.hld__excel-body .clickextend {display:none !important;}
    .hld__excel-body #mmc {margin-top:195px;margin-bottom:35px;}
    .hld__excel-body .postBtnPos > div, .hld__excel-body .postBtnPos .stdbtn a {background:#fff !important;border-color:#bbb;}
    .hld__excel-body .hld__excel-div,.hld__excel-body .hld__excel-setting {display:block;}
    .hld__excel-body .hld__excel-setting {position:fixed;width:60px;height:20px;top:5px;right:95px;background:#f2f4f7;z-index:999;}
    .hld__excel-body .hld__excel-setting img {width:20px;height:auto;vertical-align:middle;}
    .hld__excel-body .hld__excel-setting a {margin-left:5px;vertical-align:middle;}
    .hld__excel-body .hld__excel-header {position:fixed;top:0;left:0;height:196px;}
    .hld__excel-body .hld__excel-footer {position:fixed;bottom:0;left:0;height:50px;}
    .hld__excel-body .hld__excel-header, .hld__excel-body .hld__excel-footer {width: 100%;text-align: center;font-size: 16px;font-weight: bold;background:#e8e8e8;color:#337ab7;line-height: 45px;}
    .hld__excel-body .hld__excel-header>img, .hld__excel-body .hld__excel-footer>img{position:absolute;top:0;left:0}
    .hld__excel-body #m_nav {position:fixed;top:136px;left:261px;margin:0;padding:0;z-index:99;width: 9999px;}
    .hld__excel-body #m_nav .nav_spr {display:block;border:0;border-radius:0;padding:0;box-shadow:none;background:none;margin-top: 18px;margin-left: 10px;}
    .hld__excel-body #m_nav .nav_spr span {color:#000;font-size:16px;vertical-align:unset;font-weight:normal;}
    .hld__excel-body #m_nav .nav_root,.hld__excel-body #m_nav .nav_link {background:none;border:none;box-shadow:none;padding:0;color:#000;border-radius:0;font-weight:normal;}
    .hld__excel-body .nav {font-size:14px !important;}
    .hld__excel-body #mainmenu .stdbtn a {font-size:13px !important;}
    .hld__excel-body #m_threads {margin:0;}
    .hld__excel-body .postBtnPos > div {z-index:9991;}
    .hld__excel-body #topicrows {border:none;box-shadow:none;border-radius:0;margin:0;background-color:#fff;counter-reset:num;border-spacing:0;}
    .hld__excel-body #topicrows tbody {border-spacing:0;}
    .hld__excel-body .topicrow {border-spacing:0;}
    .hld__excel-body #topicrows td {background:#fff;padding:5px 0;margin:0;border:none;border-right:1px solid #bbbbbb;border-bottom:1px solid #bbbbbb;margin-right:-1px;}
    .hld__excel-body .topicrow .c1 {width:33px;background:#e8e8e8 !important;}
    .hld__excel-body .topicrow .c1 a {display:none;color: #777777 !important;font-size: 16px !important;font-family: auto;}
    .hld__excel-body.hld__excel-original-no .topicrow .c1:before {display:none;}
    .hld__excel-body.hld__excel-original-no .topicrow .c1 a {display:inline-block;}
    .hld__excel-body.hld__excel-original-no .topicrow .c1 img {width:20px;}
    .hld__excel-body .topicrow .c1:before {content:counter(num);counter-increment:num;color:#777777;font-size:16px;}
    .hld__excel-body .topicrow .c2 {padding-left:5px !important;}
    .hld__excel-body .topicrow .c3 {color:#1a3959 !important;}
    .hld__excel-body .topicrow .c3 > div, .hld__excel-body .topicrow .c4 > div {background:#FFF !important;}
    .hld__excel-body .topicrow .c3 > div a, .hld__excel-body .topicrow .c4 > div a {color:#888 !important;}
    .hld__excel-body .block_txt {background:#fff !important;color:#1a3959 !important;border-radius:0;padding:0 !important;min-width:0 !important;font-weight:normal;}
    .hld__excel-body .quote {background:#fff !important;}
    .hld__excel-body #m_posts .block_txt {font-weight:bold;}
    .hld__excel-body .topicrow .postdate,.hld__excel-body .topicrow .replydate {display:inline;margin:10px;}
    .hld__excel-body #m_pbtnbtm {margin:0;border-bottom:1px solid #bbbbbb;}
    .hld__excel-body .hld__country-flag {border:.5px solid rgba(0,0,0,.2);}
    .hld__excel-body #pagebbtm,.hld__excel-body #m_pbtnbtm .right_ {margin:0;}
    .hld__excel-body #pagebbtm:before {display:block;line-height:35px;width:33px;float:left;content:"#";border-right:1px solid #bbbbbb;color:#777;font-size:16px;background:#e8e8e8;}
    .hld__excel-body #m_pbtnbtm td {line-height:35px;padding:0 5px;}
    .hld__excel-body #m_pbtnbtm .stdbtn {box-shadow:none;border:none !important;padding:0;padding-left:5px;background:#fff;border-radius:0;font-size:13px !important;}
    .hld__excel-body #m_pbtnbtm .stdbtn .invert {color:#591804;}
    .hld__excel-body #m_pbtnbtm td a {background:#fff;padding:0;border:0;}
    .hld__excel-body #m_posts .comment_c .comment_c_1 {border-top-color:#bbbbbb;}
    .hld__excel-body #m_posts .comment_c .comment_c_2 {border-color:#bbbbbb;}
    .hld__excel-body #m_posts {border:0;box-shadow:none;padding-bottom:0;margin:0;counter-reset:num;}
    .hld__excel-body #m_posts td {background:#fff;border-top:1px solid #bbbbbb;border-right:1px solid #bbbbbb;border-bottom:1px solid #bbbbbb;}
    .hld__excel-body #m_posts .c0 {width:32px;color:#777;font-size:16px;background:#e8e8e8;text-align:center;}
    .hld__excel-body #m_posts .c0:before {content:counter(num);counter-increment:num;}
    .hld__excel-body #m_posts .vertmod {background:#fff !important;color:#ccc;}
    .hld__excel-body #m_posts a[name="uid"]:before {content:"UID:"}
    .hld__excel-body #m_posts .white,.hld__excel-body #m_posts .block_txt_c2,.hld__excel-body #m_posts .block_txt_c0 {background:#fff !important;color:#777777;}
    .hld__excel-body #m_posts .quote {background:#fff;border-color:#bbbbbb;}
    .hld__excel-body #m_posts .postrow .postinfob .iconfont,.hld__excel-body #m_posts .ogoodbtn a:hover .iconfont {fill: #10273f;}
    .hld__excel-body #m_posts .postInfo svg {fill:#10273f !important;}
    .hld__excel-body #m_posts .recommendvalue {color:#10273f !important;}
    .hld__excel-body #m_posts button {background:#eee;}
    .hld__excel-body #m_posts button:active {outline-color:#bbbbbb;}
    .hld__excel-body #m_posts .postbox {border:none !important;}
    .hld__excel-body .posterInfoLine {background: #FFF !important;border-bottom-color: #FFF !important;}
    .hld__excel-body.hld__reply-fixed #postbbtm {position:fixed;right:30px;top:75px;z-index:999;border-radius: 10px;overflow: hidden;}
    .hld__excel-body .row2 .comment_c .comment_c_1_1 {border-top-color: #FFF;}
    .hld__excel-body #m_posts .comment_c .comment_c_1 {border-color: #FFF;border-top-color: #BBB;}
    /* Office风格 */
    .hld__excel-body.hld__excel-theme-office .hld__excel-header {height:221px;}
    .hld__excel-body.hld__excel-theme-office .hld__excel-h1 {height:59px;background:#227447;display:flex;justify-content: center;}
    .hld__excel-body.hld__excel-theme-office .hld__excel-title {display: block;color:#FFF;font-size: 12px;font-weight: 400;font-family: sans-serif;line-height:30px;}
    .hld__excel-body.hld__excel-theme-office .hld__excel-h2 {height:95px;background:#f1f1f1;border-bottom:1px solid #d5d5d5;}
    .hld__excel-body.hld__excel-theme-office .hld__excel-h3 {height:48px;background:#e6e6e6;box-shadow:none;}
    .hld__excel-body.hld__excel-theme-office .hld__excel-fx {left:250px;right: 5px;border-color:#c6c6c6;border-radius:0;height:28px;}
    .hld__excel-body.hld__excel-theme-office .hld__excel-h4 {height:20px;}
    .hld__excel-body.hld__excel-theme-office .hld__excel-f1 {height:29px;}
    .hld__excel-body.hld__excel-theme-office .hld__excel-f2 {height:21px;}
    .hld__excel-body.hld__excel-theme-office .hld__excel-f1 {border-top:1px solid #999999;border-bottom:1px solid #bfbfbf;}
    .hld__excel-body.hld__excel-theme-office .hld__excel-img-f1-l1, .hld__excel-body.hld__excel-theme-office .hld__excel-img-f1-r1 {top:-1px;}
    .hld__excel-body.hld__excel-theme-office #mmc {margin-top:221px;}
    .hld__excel-body.hld__excel-theme-office #m_nav {top:160px;}
    .hld__excel-body.hld__excel-theme-office #m_posts .c0,
    .hld__excel-body.hld__excel-theme-office .topicrow .c1 {width:32px;}
    .hld__excel-body.hld__excel-theme-office #pagebbtm:before,
    .hld__excel-body.hld__excel-theme-office .topicrow .c1 a {width:28px;}
    .hld__excel-body.hld__excel-theme-office .hld__excel-setting {top: 36px;background:none;text-align: center;}
    .hld__excel-body.hld__excel-theme-office .hld__excel-setting a {color:#FFFFFF;}
    .hld__excel-body.hld__excel-theme-office .hld__excel-setting img {display:none;}
    .hld__excel-body.hld__excel-theme-office.hld__reply-fixed #postbbtm {top: 162px;}
    .hld__excel-body.hld__excel-theme-office #m_pbtnbtm td a,
    .hld__excel-body.hld__excel-theme-office #m_pbtnbtm .stdbtn {background: none;}
    .hld__excel-body.hld__excel-theme-office #mainmenu {top:35px;right:45px;}
    .hld__excel-body.hld__excel-theme-office #mainmenu .mmdefault.cell input {border-radius:0;}
    .hld__excel-body.hld__excel-theme-office #mainmenu .stdbtn a, .hld__excel-body.hld__excel-theme-office #mainmenu .hld__half-clone {color:#FFF !important;}
    .hld__excel-body.hld__excel-theme-office .single_ttip2 {top:59px !important;}
    /* 腾讯文档风格 */
    .hld__excel-body.hld__excel-theme-tencent {font-family: -apple-system, Helvetica Neue, Helvetica, PingFang SC, Microsoft YaHei, Source Han Sans SC, Noto Sans CJK SC, WenQuanYi Micro Hei, sans-serif !important;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-header {height:125px;background:#FFF;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-titlebar-title {height: 36px;line-height: 36px;font-size: 18px;font-weight: 500;color: #000;opacity: 0.88;margin: 0 9px;max-width: 30%;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;}
    .hld__excel-body.hld__excel-theme-tencent #mmc {margin-top: 145px;}
    .hld__excel-body.hld__excel-theme-tencent #m_nav {top: 94px;left: 65px;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-sub {width: 51px;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-titlebar {height:56px;display: flex;align-items: center;flex-shrink: 0;padding: 0 4px;border-bottom:1px solid #ebebeb;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-toolbar {height:44px;display: flex;align-items: center;flex-shrink: 0;padding: 0 12px;border-bottom:1px solid #ebebeb;line-height: 24px;font-size: 12px;color:rgba(0, 0, 0, 0.88);font-weight:400;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-toolbar > div {flex-shrink: 0;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-titlebar-pick {margin-left: 12px;margin-top: -2px;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-titlebar-pick .hld__excel-titlebar-content {width:17px;height:17px}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-titlebar-pick .hld__excel-titlebar-indication {height: 3px;width: 14px;margin-left: 2px;margin-top: -2px;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-formulabar {height:25px;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-icon24 {width:24px;height:24px;background-size: 100% 100%;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-icon20 {width:20px;height:20px;background-size: 100% 100%;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-icon16 {width:16px;height:16px;background-size: 100% 100%;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-icon12 {width:12px;height:12px;background-size: 100% 100%;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-h4 > div {background-color:#f9fafb;border-bottom: 1px solid #ebebeb;border-top: 1px solid #ebebeb;border-color:#ebebeb;}
    .hld__excel-body.hld__excel-theme-tencent #m_posts .c0, .hld__excel-body.hld__excel-theme-tencent .topicrow .c1, .hld__excel-body.hld__excel-theme-tencent #pagebbtm:before {width:50px;background-color:#f9fafb !important;}
    .hld__excel-body.hld__excel-theme-tencent #topicrows td, .hld__excel-body.hld__excel-theme-tencent #m_posts td {border-color:#ebebeb;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-footer {height:32px;background:#FFF;display:flex;align-items: center;border-top: 1px solid #e0e0e0;padding: 0 10px;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-sheet-tab {margin-left: 8px;width:104px;border: 1px solid #e0e0e0;border-top: 1px solid #fff;text-align:center;height: 30px;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-sheet-tab .hld__excel-sheet-name {font-size: 14px;color: rgba(0,0,0,.88);font-weight: 400;height: 26px;line-height: 26px;border-bottom:2px solid #1e6fff;display:flex;justify-content: center;align-items: center;}
    .hld__excel-body.hld__excel-theme-tencent .hld__excel-footer-item {color:#464d5a;font-size:14px;margin:0 4px;height: 32px;line-height: 32px;}
    .hld__excel-body.hld__excel-theme-tencent #mainmenu {top: 18px;right: 20px;}
    .hld__excel-body.hld__excel-theme-tencent #postbbtm {top: 60px;right: 5px;}
    .hld__excel-body.hld__excel-theme-tencent #m_pbtnbtm .stdbtn, .hld__excel-body.hld__excel-theme-tencent #m_pbtnbtm .stdbtn a {background: none;font-weight:400;}
    .hld__excel-body.hld__excel-theme-tencent #m_pbtnbtm .uitxt1 span {font-size: 1em !important;color: #10273f;}
    .hld__excel-body.hld__excel-theme-tencent #mainmenu .mmdefault.cell input {background: #FFF;}
  `
};
