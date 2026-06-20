import { NGA_Module, NGABBSScript } from "../core/app";
import { Storage } from "../core/storage";

let postAuthors: string[] = [];

const getQueryString = (name: string, urlStr = window.location.href) => {
  try {
    const url = new URL(urlStr.replace(/&amp;/g, "&"));
    return url.searchParams.get(name);
  } catch {
    const reg = new RegExp("(?:\\?|&)" + name + "=([^&]*)(&|$)");
    const result = decodeURIComponent(urlStr.replace(/&amp;/g, "&")).match(reg);
    return result?.[1] ?? null;
  }
};

const normalizeAuthorName = (name: string) =>
  name.replace("[", "").replace("]", "").replace("楼主", "").trim();

const rememberCurrentAuthor = () => {
  const author = normalizeAuthorName(document.getElementById("postauthor0")?.textContent ?? "");
  const tid = getQueryString("tid");
  if (
    !author ||
    !tid ||
    window.location.href.includes("authorid=") ||
    window.location.href.includes("pid=")
  ) {
    return;
  }

  const authorKey = `${tid}:${author}`;
  if (postAuthors.includes(authorKey)) return;

  postAuthors.unshift(authorKey);
  if (postAuthors.length > 10) postAuthors.pop();
  void Storage.set("hld__NGA_post_author", postAuthors.join(","));
};

export const AuthorMarkModule: NGA_Module = {
  name: "AuthorMark",

  async initFunc() {
    const localPostAuthor = await Storage.get<string>("hld__NGA_post_author");
    postAuthors = localPostAuthor ? localPostAuthor.split(",").filter(Boolean) : [];
  },

  renderFormsFunc($el: HTMLElement, app: NGABBSScript) {
    if (!app.setting.normal.authorMark) return;

    rememberCurrentAuthor();

    const tid = getQueryString("tid");
    if (!tid) return;

    $el.querySelectorAll("a.userlink").forEach((el) => {
      const a = el as HTMLAnchorElement;
      if (a.nextElementSibling?.classList.contains("hld__post-author")) return;

      const name = normalizeAuthorName(
        a.getAttribute("hld-mark-before-name") || a.textContent || ""
      );
      if (!name || !postAuthors.includes(`${tid}:${name}`)) return;

      const span = document.createElement("span");
      span.className = "hld__post-author";
      span.textContent = "楼主";
      a.insertAdjacentElement("afterend", span);
    });
  },

  asyncStyle(app: NGABBSScript) {
    const color = (app.setting.advanced.authorMarkColor as string) || "#F00";
    return `
      .hld__post-author {
        background: ${color};
        color: #FFF;
        display: inline-block;
        padding: 0 5px;
        margin-left: 5px;
        border-radius: 5px;
        font-weight: bold;
        line-height: 1.4em;
        padding-top: 0.1em;
        padding-bottom: 0;
      }
    `;
  }
};
