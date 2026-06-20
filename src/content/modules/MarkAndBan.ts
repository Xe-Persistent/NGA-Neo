import { NGA_Module, NGABBSScript } from "../core/app";
import { Storage } from "../core/storage";

export interface UserMark {
  mark: string;
  text_color: string;
  bg_color: string;
  desc?: string;
}

export interface MarkUser {
  uid: string;
  name: string;
  marks: UserMark[];
}

export interface BanUser {
  uid: string;
  name: string;
  desc?: string;
}

type BanMode = "HIDE" | "REMOVE" | "ALL";

interface UserIdentity {
  uid: string;
  name: string;
}

let banList: BanUser[] = [];
let markList: MarkUser[] = [];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown): string => (typeof value === "string" ? value : "");

const normalizeName = (name: string) =>
  name.replace("[", "").replace("]", "").replace(/楼主$/, "").trim();

const parseUidFromHref = (href: string | null) => {
  if (!href) return "";
  const match = href.match(/[?&]uid=(\d+)/);
  return match?.[1] ?? "";
};

const parseBanList = (value: string | null): BanUser[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isRecord)
      .map((item) => ({
        uid: readString(item.uid),
        name: readString(item.name),
        desc: readString(item.desc) || undefined
      }))
      .filter((item) => item.uid || item.name);
  } catch {
    return [];
  }
};

const parseMarkList = (value: string | null): MarkUser[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isRecord)
      .map((item) => {
        const marksRaw = Array.isArray(item.marks) ? item.marks : [];
        const marks = marksRaw
          .filter(isRecord)
          .map((mark) => ({
            mark: readString(mark.mark),
            text_color: readString(mark.text_color) || "#000",
            bg_color: readString(mark.bg_color) || "#ffd966",
            desc: readString(mark.desc) || undefined
          }))
          .filter((mark) => mark.mark);

        return {
          uid: readString(item.uid),
          name: readString(item.name),
          marks
        };
      })
      .filter((item) => (item.uid || item.name) && item.marks.length > 0);
  } catch {
    return [];
  }
};

const getUserFromLink = (link: Element | null): UserIdentity | null => {
  if (!(link instanceof HTMLAnchorElement)) return null;
  const uid = parseUidFromHref(link.getAttribute("href"));
  const name =
    readString(link.getAttribute("hld-mark-before-name")) ||
    normalizeName(link.textContent ?? "");
  if (!uid && !name) return null;
  return { uid, name };
};

const getPostAuthor = ($el: HTMLElement): UserIdentity | null => {
  const uid = normalizeName($el.querySelector('a[name="uid"]')?.textContent ?? "");
  const authorLink =
    $el.querySelector(".posterInfoLine .author") ||
    $el.querySelector(".posterinfo .author") ||
    $el.querySelector("a.userlink.author") ||
    $el.querySelector("a.userlink");
  const name = normalizeName(authorLink?.textContent ?? "");
  if (!uid && !name) return null;
  return { uid, name };
};

const getBanUser = (user: UserIdentity): BanUser | null =>
  banList.find(
    (banUser) =>
      Boolean(banUser.uid && user.uid && banUser.uid === user.uid) ||
      Boolean(banUser.name && user.name && banUser.name === user.name)
  ) ?? null;

const getUserMarks = (user: UserIdentity): MarkUser | null =>
  markList.find(
    (markUser) =>
      Boolean(markUser.uid && user.uid && markUser.uid === user.uid) ||
      Boolean(markUser.name && user.name && markUser.name === user.name)
  ) ?? null;

const saveBanList = () => Storage.set("hld__NGA_ban_list", JSON.stringify(banList));

const saveMarkList = () => Storage.set("hld__NGA_mark_list", JSON.stringify(markList));

const createBannedBlock = (banUser: BanUser, hiddenElement: HTMLElement) => {
  const block = document.createElement("div");
  block.className = "hld__banned hld__banned-block";
  block.textContent = "此用户在你的黑名单中，已屏蔽其言论，点击查看";
  if (banUser.desc) {
    const desc = document.createElement("div");
    desc.textContent = `备注: ${banUser.desc}`;
    block.appendChild(desc);
  }
  block.addEventListener("click", () => {
    block.remove();
    hiddenElement.style.display = "";
  });
  return block;
};

const renderMarks = (anchor: Element | null, user: UserIdentity) => {
  if (!(anchor instanceof HTMLElement)) return;
  if (anchor.nextElementSibling?.classList.contains("hld__marks-container")) return;

  const userMarks = getUserMarks(user);
  if (!userMarks) return;

  const container = document.createElement("span");
  container.className = "hld__marks-container";
  container.textContent = "标签: ";

  userMarks.marks.forEach((item) => {
    const span = document.createElement("span");
    span.textContent = item.mark;
    span.title = item.desc ?? item.mark;
    span.style.color = item.text_color;
    span.style.backgroundColor = item.bg_color;
    container.appendChild(span);
  });

  anchor.insertAdjacentElement("afterend", container);
};

const openMarkPopup = (uid: string, name: string) => {
  document.getElementById("hld__mark_popup")?.remove();

  const popup = document.createElement("div");
  popup.id = "hld__mark_popup";

  const panel = document.createElement("div");
  panel.className = "hld__mark-popup-panel";

  const title = document.createElement("h3");
  title.textContent = `标记用户: ${name || uid}`;
  panel.appendChild(title);

  const uidText = document.createElement("div");
  uidText.className = "hld__mark-popup-uid";
  uidText.textContent = `UID: ${uid || "未知"}`;
  panel.appendChild(uidText);

  const input = document.createElement("input");
  input.id = "hld__mark_input";
  input.type = "text";
  input.placeholder = "输入标签内容...";
  panel.appendChild(input);

  const buttons = document.createElement("div");
  buttons.className = "hld__mark-popup-buttons";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "取消";
  cancelButton.addEventListener("click", () => popup.remove());
  buttons.appendChild(cancelButton);

  const saveButton = document.createElement("button");
  saveButton.textContent = "保存";
  saveButton.className = "hld__mark-popup-save";
  saveButton.addEventListener("click", () => {
    const tag = input.value.trim();
    if (!tag) return;

    let user = getUserMarks({ uid, name });
    if (!user) {
      user = { uid, name, marks: [] };
      markList.push(user);
    }
    user.marks.push({ mark: tag, bg_color: "#ffd966", text_color: "#000" });
    void saveMarkList().then(() => window.location.reload());
  });
  buttons.appendChild(saveButton);

  panel.appendChild(buttons);
  popup.appendChild(panel);
  document.body.appendChild(popup);
  input.focus();
};

const openBanPopup = (uid: string, name: string) => {
  const desc = window.prompt(`拉黑用户 ${name || uid}，可填写备注。留空表示不添加备注。`, "");
  if (desc === null) return;

  if (!getBanUser({ uid, name })) {
    banList.push({ uid, name, desc: desc.trim() || undefined });
    void saveBanList().then(() => window.location.reload());
  }
};

const renderOperationButtons = ($el: HTMLElement, user: UserIdentity) => {
  const container = $el.querySelector(".posterInfoLine, .postinfob");
  if (!container || container.querySelector(".hld__icon-mark")) return;

  const markButton = document.createElement("button");
  markButton.type = "button";
  markButton.className = "hld__icon-mark hld__icon-btn";
  markButton.textContent = "标记";
  markButton.addEventListener("click", () => openMarkPopup(user.uid, user.name));
  container.appendChild(markButton);

  const banButton = document.createElement("button");
  banButton.type = "button";
  banButton.className = "hld__icon-ban hld__icon-btn";
  banButton.textContent = "拉黑";
  banButton.addEventListener("click", () => openBanPopup(user.uid, user.name));
  container.appendChild(banButton);
};

const applyPostBan = ($el: HTMLElement, banUser: BanUser, mode: BanMode) => {
  if ($el.dataset.bannedProcessed) return true;
  $el.dataset.bannedProcessed = "true";

  if (mode === "REMOVE" || mode === "ALL") {
    $el.remove();
    return false;
  }

  const postContent = $el.querySelector(".c2 .postcontent, .postcontent");
  if (postContent instanceof HTMLElement) {
    postContent.style.display = "none";
    postContent.insertAdjacentElement("afterend", createBannedBlock(banUser, postContent));
  }

  return true;
};

const applyCommentBan = (comment: HTMLElement, banUser: BanUser, mode: BanMode) => {
  if (comment.dataset.bannedProcessed) return;
  comment.dataset.bannedProcessed = "true";

  if (mode === "ALL") {
    comment.remove();
    return;
  }

  const content = comment.querySelector(".ubbcode");
  if (!(content instanceof HTMLElement)) return;

  if (mode === "REMOVE") {
    content.replaceChildren();
    const deleted = document.createElement("div");
    deleted.className = "hld__banned";
    deleted.textContent = "此用户在你的黑名单中，已删除其言论";
    content.appendChild(deleted);
    return;
  }

  content.style.display = "none";
  content.insertAdjacentElement("afterend", createBannedBlock(banUser, content));
};

const resolveBanMode = (value: unknown): BanMode => {
  if (value === "REMOVE" || value === "ALL") return value;
  return "HIDE";
};

export const MarkAndBanModule: NGA_Module = {
  name: "MarkAndBan",

  async initFunc(app: NGABBSScript) {
    if (!app.setting.normal.markAndBan) return;
    banList = parseBanList(await Storage.get<string>("hld__NGA_ban_list"));
    markList = parseMarkList(await Storage.get<string>("hld__NGA_mark_list"));
  },

  renderThreadsFunc($el: HTMLElement, app: NGABBSScript) {
    if (!app.setting.normal.markAndBan || banList.length === 0) return;

    const authorLink = $el.querySelector(".author");
    const user = getUserFromLink(authorLink);
    if (!user) return;

    const banUser = getBanUser(user);
    if (!banUser) return;

    const title = $el.querySelector(".c2 > a")?.textContent?.trim() ?? "";
    app.printLog(`Ban list hit in thread list. uid=${user.uid} name=${user.name} title=${title}`);
    $el.closest("tbody")?.remove();
    $el.remove();
  },

  renderFormsFunc($el: HTMLElement, app: NGABBSScript) {
    if (!app.setting.normal.markAndBan) return;

    const mode = resolveBanMode(app.setting.advanced.banStrictMode);
    const postUser = getPostAuthor($el);
    if (!postUser) return;

    const postBanUser = getBanUser(postUser);
    if (postBanUser && !applyPostBan($el, postBanUser, mode)) return;

    const uidAnchor = $el.querySelector('a[name="uid"]');
    renderMarks(uidAnchor, postUser);
    renderOperationButtons($el, postUser);

    $el.querySelectorAll(".comment_c").forEach((commentEl) => {
      if (!(commentEl instanceof HTMLElement)) return;

      const commentUser = getUserFromLink(commentEl.querySelector("a.userlink"));
      if (!commentUser) return;

      const commentBanUser = getBanUser(commentUser);
      if (commentBanUser) {
        applyCommentBan(commentEl, commentBanUser, mode);
      }
      renderMarks(commentEl.querySelector("a.userlink"), commentUser);
    });
  },

  style: `
    .hld__icon-btn { cursor: pointer; margin-left: 10px; padding: 0 4px; font-size: 12px; color: #888; background: transparent; border: 0; transition: color 0.2s; }
    .hld__icon-btn:hover { color: #f44336; }
    .hld__banned { display: inline-block; color: #ba2026; border: 1px dashed #ba2026; padding: 10px 20px; font-weight: bold; }
    .hld__banned > div { font-weight: normal; }
    .hld__banned-block:hover { text-decoration: underline; cursor: pointer; }
    .hld__marks-container { margin-left: 5px; font-size: 12px; }
    .hld__marks-container > span { display: inline-block; padding: 1px 5px; border-radius: 3px; margin-left: 5px; margin-top: 5px; }
    #hld__mark_popup { position: fixed; inset: 0; z-index: 99999; background: rgba(0, 0, 0, 0.2); }
    .hld__mark-popup-panel { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 20px; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); width: 300px; border-radius: 8px; }
    .hld__mark-popup-panel h3 { margin-top: 0; font-size: 16px; }
    .hld__mark-popup-uid { font-size: 12px; color: #666; margin-bottom: 10px; }
    #hld__mark_input { width: 100%; margin-bottom: 10px; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
    .hld__mark-popup-buttons { text-align: right; }
    .hld__mark-popup-buttons button { padding: 5px 15px; margin-left: 10px; border-radius: 4px; cursor: pointer; }
    .hld__mark-popup-save { background: #1890ff; color: #fff; border: none; }
  `
};
