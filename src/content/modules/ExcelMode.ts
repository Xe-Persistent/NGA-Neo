import _style_ExcelMode from './ExcelMode.scss?inline';
import _html_ExcelHeaderTencent from './ExcelHeaderTencent.html?raw';
import _html_ExcelFooterTencent from './ExcelFooterTencent.html?raw';
import _html_ExcelHeaderWPS from './ExcelHeaderWPS.html?raw';
import _html_ExcelFooterWPS from './ExcelFooterWPS.html?raw';
import _html_ExcelHeaderOffice from './ExcelHeaderOffice.html?raw';
import _html_ExcelFooterOffice from './ExcelFooterOffice.html?raw';
import type { NGA_Module, NGABBSScript } from '../core/app';
import { getExcelTheme, IMG_EXCEL_ICON } from './ExcelThemeAssets';
import { escapeHtml } from '@/lib/html';

let beforeUrl = window.location.href;

const enableExcelMode = (app: NGABBSScript) => {
  document.body.classList.add('nga-excel-body');
  if (!app.setting.advanced.excelNoMode) {
    document.body.classList.add('nga-excel-original-no');
  }
};

interface RenderContext {
  theme: string;
  excelTitle: string;
  columns: string;
  toolbarIcons?: string;
  alignIcons?: string;
  borderIcons?: string;
}

const renderTemplate = (htmlText: string, context: RenderContext) => {
  const safeTitle = escapeHtml(context.excelTitle);
  return htmlText
    .replace(/\{\{EXCEL_TITLE\}\}/g, safeTitle)
    .replace(/\{\{COLUMNS\}\}/g, context.columns)
    .replace(/\{\{TOOLBAR_ICONS\}\}/g, context.toolbarIcons ?? '')
    .replace(/\{\{ALIGN_ICONS\}\}/g, context.alignIcons ?? '')
    .replace(/\{\{BORDER_ICONS\}\}/g, context.borderIcons ?? '')
    .replace(/THEME_ASSET:([a-zA-Z0-9_]+)/g, (_, key) => getExcelTheme(context.theme, key));
};

export const ExcelModeModule: NGA_Module = {
  name: 'ExcelMode',

  async initFunc(app: NGABBSScript) {
    if (!app.setting.normal.excelMode) return;

    const styleEl = document.createElement('style');
    styleEl.textContent = _style_ExcelMode;
    document.head.appendChild(styleEl);

    // 生成列标题字母列表。
    const columnLetters = () => {
      const capital: string[] = [];
      const columnLetters: string[] = [];
      for (let i = 65; i < 91; i++) capital.push(String.fromCharCode(i));
      ['', 'A', 'B', 'C'].forEach((n) => capital.forEach((c) => columnLetters.push(`${n}${c}`)));
      return columnLetters;
    };

    const theme = app.setting.advanced.excelTheme || 'wps';
    const excelTitle = app.setting.advanced.excelTitle || document.title;

    let headerHtml: string;
    let footerHtml: string;
    const colsHtml = columnLetters()
      .map((c) => '<div class="nga-excel-column">' + c + '</div>')
      .join('');

    switch (theme) {
      case 'office': {
        headerHtml = renderTemplate(_html_ExcelHeaderOffice, {
          theme,
          excelTitle,
          columns: colsHtml,
        });
        footerHtml = renderTemplate(_html_ExcelFooterOffice, {
          theme,
          excelTitle,
          columns: colsHtml,
        });
        break;
      }
      case 'wps': {
        headerHtml = renderTemplate(_html_ExcelHeaderWPS, {
          theme,
          excelTitle,
          columns: colsHtml,
        });
        footerHtml = renderTemplate(_html_ExcelFooterWPS, {
          theme,
          excelTitle,
          columns: colsHtml,
        });
        break;
      }
      case 'tencent':
      default: {
        const toolbarIcons = Array.from(
          { length: 4 },
          (_, i) =>
            '<div class="nga-excel-titlebar-content nga-excel-icon20" style="margin:0 6px;background-image:url(' +
            getExcelTheme('tencent', 'icon_' + (10 + i)) +
            ');"></div>',
        ).join('');
        const alignIcons = Array.from(
          { length: 4 },
          (_, i) =>
            '<div class="nga-excel-titlebar-content nga-excel-icon20" style="background-image:url(' +
            getExcelTheme('tencent', 'icon_' + (21 + i)) +
            ');"></div><div class="nga-excel-titlebar-content nga-excel-icon12" style="margin-left: 2px;margin-right: ' +
            (i === 3 ? '0' : '10') +
            'px;background-image:url(' +
            getExcelTheme('tencent', 'icon_2') +
            ');"></div>',
        ).join('');
        const borderIcons = Array.from(
          { length: 4 },
          (_, i) =>
            '<div class="nga-excel-titlebar-content nga-excel-icon20" style="background-image:url(' +
            getExcelTheme('tencent', 'icon_' + (26 + i)) +
            ');"></div><div class="nga-excel-titlebar-content nga-excel-icon12" style="margin-left: 2px;margin-right: ' +
            (i === 3 ? '0' : '10') +
            'px;background-image:url(' +
            getExcelTheme('tencent', 'icon_2') +
            ');"></div>',
        ).join('');

        headerHtml = renderTemplate(_html_ExcelHeaderTencent, {
          theme: 'tencent',
          excelTitle,
          columns: colsHtml,
          toolbarIcons,
          alignIcons,
          borderIcons,
        });
        footerHtml = renderTemplate(_html_ExcelFooterTencent, {
          theme: 'tencent',
          excelTitle,
          columns: colsHtml,
        });
        break;
      }
    }

    document.body.insertAdjacentHTML('beforeend', headerHtml);
    document.body.insertAdjacentHTML('beforeend', footerHtml);

    const halfMenu = document.querySelector('#mainmenu .half');
    if (halfMenu && halfMenu.parentElement) {
      const clone = halfMenu.cloneNode(true) as HTMLElement;
      clone.classList.add('nga-half-clone');
      clone.textContent = (halfMenu.textContent || '').replace('你好', '');
      halfMenu.parentElement.appendChild(clone);
    }

    if (app.setting.normal.excelMode) {
      if (beforeUrl && (beforeUrl.includes('thread.php') || beforeUrl.includes('read.php'))) {
        enableExcelMode(app);
      }
    }
  },

  renderAlwaysFunc(app: NGABBSScript) {
    const theme = app.setting.advanced.excelTheme || 'tencent';
    const themeClass = `nga-excel-theme-${theme}`;
    if (!document.body.classList.contains(themeClass)) {
      document.body.classList.add(themeClass);
    }

    if (app.setting.normal.excelMode && window.location.href !== beforeUrl) {
      beforeUrl = window.location.href;
      if (beforeUrl.includes('thread.php') || beforeUrl.includes('read.php')) {
        if (!document.querySelector('.nga-excel-body')) {
          document.body.classList.add('nga-excel-body');
        }
      } else {
        if (document.querySelector('.nga-excel-body')) {
          document.body.classList.remove('nga-excel-body');
        }
      }
      if (!app.setting.advanced.excelNoMode) {
        document.body.classList.add('nga-excel-original-no');
      } else {
        document.body.classList.remove('nga-excel-original-no');
      }
    }

    if (
      app.setting.normal.excelMode &&
      document.querySelector('.nga-excel-body') &&
      !document.getElementById('mmc')
    ) {
      document.body.classList.add('nga-excel-body-err');
    } else {
      document.body.classList.remove('nga-excel-body-err');
    }

    // Excel Title
    if (document.querySelector('.nga-excel-body')) {
      const excelTitle = app.setting.advanced.excelTitle;
      if (excelTitle && document.title !== excelTitle) {
        document.title = excelTitle;
      }
      const titleEl = document.querySelector('.nga-excel-titlebar-title');
      if (titleEl) {
        titleEl.textContent = excelTitle || document.title;
      }
      if (!document.getElementById('nga-excel-icon')) {
        const link = document.createElement('link');
        link.id = 'nga-excel-icon';
        link.rel = 'shortcut icon';
        link.type = 'image/png';
        link.href = IMG_EXCEL_ICON;
        document.head.appendChild(link);
      }
    }
  },

  renderFormsFunc($el: HTMLElement, app: NGABBSScript) {
    if (!app.setting.normal.excelMode) return;
    const tdFirst = $el.querySelector('.postrow > td:first-child');
    if (tdFirst) {
      tdFirst.insertAdjacentHTML('beforebegin', '<td class="c0"></td>');
    }
  },
};
