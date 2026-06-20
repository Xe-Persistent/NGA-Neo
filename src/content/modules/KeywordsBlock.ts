import { NGA_Module, NGABBSScript } from "../core/app";
import { Storage } from "../core/storage";

let keywordsList: string[] = [];

const isKeywordHits = (keyword: string, text: string) => {
  if (keyword.startsWith("/")) {
    const matchRegKeyword = keyword.match(/^\/(.*)\/([gimsuy]*)$/);
    if (matchRegKeyword) {
      try {
        const regex = new RegExp(matchRegKeyword[1], matchRegKeyword[2]);
        return regex.test(text);
      } catch {
        return false;
      }
    }
  }
  return text.includes(keyword);
};

export const KeywordsBlockModule: NGA_Module = {
  name: "KeywordsBlock",
  title: "关键字屏蔽",

  async initFunc(app: NGABBSScript) {
    if (!app.setting.normal.keywordsBlock) return;
    const localStr = await Storage.get<string>("hld__NGA_keywords_list");
    if (localStr) {
      try {
        keywordsList = JSON.parse(localStr);
      } catch {
        keywordsList = localStr.split(",");
      }
    }
  },

  renderThreadsFunc($el: HTMLElement, app: NGABBSScript) {
    if (!app.setting.normal.keywordsBlock || keywordsList.length === 0) return;
    if (app.setting.advanced.kwdBlockContent === "BODY") return;

    const titleEl = $el.querySelector(".c2 > a");
    if (!titleEl) return;
    const title = titleEl.textContent || "";

    for (const keyword of keywordsList) {
      if (isKeywordHits(keyword, title)) {
        app.printLog(`Keyword block hit in title. keyword=${keyword} title=${title}`);
        $el.closest("tbody")?.remove();
        $el.remove();
        break;
      }
    }
  },

  renderFormsFunc($el: HTMLElement, app: NGABBSScript) {
    if (!app.setting.normal.keywordsBlock || keywordsList.length === 0) return;
    if (app.setting.advanced.kwdBlockContent === "TITLE") return;

    const postcontent = $el.querySelector(".postcontent");
    if (!postcontent) return;

    const clone = postcontent.cloneNode(true) as HTMLElement;

    let quoteText = "";
    const quote = clone.querySelector(".quote");
    if (quote) {
      const fullQuoteText = quote.textContent || "";
      const endIndex = fullQuoteText.indexOf(")");
      quoteText = fullQuoteText.substring(endIndex + 1);
      quote.remove();
    }

    const mainText = clone.textContent || "";

    let blocked = false;
    for (const keyword of keywordsList) {
      if (mainText && isKeywordHits(keyword, mainText)) {
        app.printLog(`Keyword block hit in post body. keyword=${keyword}`);
        $el.remove();
        blocked = true;
        break;
      }
      if (quoteText && isKeywordHits(keyword, quoteText)) {
        app.printLog(`Keyword block hit in quote. keyword=${keyword}`);
        const originalQuote = postcontent.querySelector(".quote");
        if (originalQuote) {
          originalQuote.remove();
        }
      }
    }

    if (!blocked) {
      const commentCList = $el.querySelectorAll(".comment_c");
      commentCList.forEach((commentEl) => {
        const ubbcode = commentEl.querySelector(".ubbcode");
        if (ubbcode) {
          const ubbText = ubbcode.textContent || "";
          const endIndex = ubbText.indexOf(")");
          const replyText = ubbText.substring(endIndex + 1);
          for (const keyword of keywordsList) {
            if (replyText && isKeywordHits(keyword, replyText)) {
              app.printLog(`Keyword block hit in comment. keyword=${keyword}`);
              commentEl.remove();
            }
          }
        }
      });
    }
  }
};
