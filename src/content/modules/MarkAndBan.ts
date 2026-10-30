import _style_MarkAndBan from './MarkAndBan.scss?inline';
import { createIcons, Tag, Ban, X, Plus, Trash2 } from 'lucide';
import type { NGA_Module, NGABBSScript } from '../core/app';
import { Storage } from '../core/storage';
import { readString, normalizeName } from '@/lib/guards';
import type { MarkUser, BanUser, UserMark, TagStats } from '@/lib/types';
import { parseBanList, parseMarkList } from '@/lib/parsers';

type BanMode = 'HIDE' | 'REMOVE' | 'ALL';

interface UserIdentity {
  uid: string;
  name: string;
}

let banList: BanUser[] = [];
let markList: MarkUser[] = [];
let markedTags: TagStats[] = [];

const parseUidFromHref = (href: string | null) => {
  if (!href) return '';
  const match = href.match(/[?&]uid=(\d+)/);
  return match?.[1] ?? '';
};

const getUserFromLink = (link: Element | null): UserIdentity | null => {
  if (!(link instanceof HTMLAnchorElement)) return null;
  const uid = parseUidFromHref(link.getAttribute('href'));
  const name =
    readString(link.getAttribute('nga-mark-before-name')) || normalizeName(link.textContent ?? '');
  if (!uid && !name) return null;
  return { uid, name };
};

const getPostAuthor = ($el: HTMLElement): UserIdentity | null => {
  const uid = normalizeName($el.querySelector('a[name="uid"]')?.textContent ?? '');
  const authorLink =
    $el.querySelector('.posterInfoLine .author') ||
    $el.querySelector('.posterinfo .author') ||
    $el.querySelector('a.userlink.author') ||
    $el.querySelector('a.userlink');
  const name = normalizeName(authorLink?.textContent ?? '');
  if (!uid && !name) return null;
  return { uid, name };
};

/**
 * 查找黑名单用户，并自动补全缺失的 uid/name
 */
const getBanUser = (user: UserIdentity): BanUser | null => {
  const found = banList.find(
    (banUser) =>
      Boolean(banUser.uid && user.uid && banUser.uid === user.uid) ||
      Boolean(banUser.name && user.name && banUser.name === user.name),
  );
  if (!found) return null;

  // 自动补全缺失的 uid 或 name
  let needSave = false;
  if (!found.uid && user.uid) {
    found.uid = user.uid;
    needSave = true;
  }
  if (!found.name && user.name) {
    found.name = user.name;
    needSave = true;
  }
  if (needSave) {
    void saveBanList();
  }
  return found;
};

/**
 * 查找标记用户，并自动补全缺失的 uid/name
 */
const getUserMarks = (user: UserIdentity): MarkUser | null => {
  const found = markList.find(
    (markUser) =>
      Boolean(markUser.uid && user.uid && markUser.uid === user.uid) ||
      Boolean(markUser.name && user.name && markUser.name === user.name),
  );
  if (!found) return null;

  // 自动补全缺失的 uid 或 name
  let needSave = false;
  if (!found.uid && user.uid) {
    found.uid = user.uid;
    needSave = true;
  }
  if (!found.name && user.name) {
    found.name = user.name;
    needSave = true;
  }
  if (needSave) {
    void saveMarkList();
  }
  return found;
};

const saveBanList = () => Storage.set('nga-ban-list', JSON.stringify(banList));

const saveMarkList = () => Storage.set('nga-mark-list', JSON.stringify(markList));

/**
 * 统计所有已使用过的标签，按使用次数降序排序
 */
const buildMarkedTags = (): TagStats[] => {
  const tagMap = new Map<string, TagStats>();
  for (const user of markList) {
    for (const mark of user.marks) {
      const existing = tagMap.get(mark.mark);
      if (existing) {
        existing.count += 1;
      } else {
        tagMap.set(mark.mark, {
          mark: mark.mark,
          text_color: mark.text_color,
          bg_color: mark.bg_color,
          desc: mark.desc,
          count: 1,
        });
      }
    }
  }
  return Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
};

const createBannedBlock = (banUser: BanUser, hiddenElement: HTMLElement) => {
  const block = document.createElement('div');
  block.className = 'nga-banned nga-banned-block';
  block.textContent = '此用户在你的黑名单中，已屏蔽其言论，点击查看';
  if (banUser.desc) {
    const desc = document.createElement('div');
    desc.textContent = `备注: ${banUser.desc}`;
    block.appendChild(desc);
  }
  block.addEventListener('click', () => {
    block.remove();
    hiddenElement.style.display = '';
  });
  return block;
};

const renderMarks = (anchor: Element | null, user: UserIdentity) => {
  if (!(anchor instanceof HTMLElement)) return;
  if (anchor.nextElementSibling?.classList.contains('nga-marks-container')) return;

  const userMarks = getUserMarks(user);
  if (!userMarks) return;

  const container = document.createElement('span');
  container.className = 'nga-marks-container';
  container.textContent = '标签: ';

  userMarks.marks.forEach((item) => {
    const span = document.createElement('span');
    span.textContent = item.mark;
    span.title = item.desc ?? item.mark;
    span.style.color = item.text_color;
    span.style.backgroundColor = item.bg_color;
    container.appendChild(span);
  });

  anchor.insertAdjacentElement('afterend', container);
};

// ========== 简单弹窗（仅用于拉黑确认） ==========

interface SimplePopupOptions {
  title: string;
  uid: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  onSave: (value: string) => void;
}

const showSimplePopup = (options: SimplePopupOptions) => {
  document.getElementById('nga-custom-popup')?.remove();

  const popup = document.createElement('div');
  popup.id = 'nga-custom-popup';
  popup.className = 'nga-popup-overlay';

  const panel = document.createElement('div');
  panel.className = 'nga-popup-panel';

  const titlebar = document.createElement('div');
  titlebar.className = 'nga-popup-titlebar';

  const title = document.createElement('span');
  title.className = 'nga-popup-title-text';
  title.textContent = options.title;
  titlebar.appendChild(title);

  const closeBtn = document.createElement('span');
  closeBtn.className = 'nga-popup-close-btn';
  closeBtn.title = '关闭';
  const closeIcon = document.createElement('i');
  closeIcon.dataset.lucide = 'x';
  closeBtn.appendChild(closeIcon);
  titlebar.appendChild(closeBtn);

  panel.appendChild(titlebar);

  const content = document.createElement('div');
  content.className = 'nga-popup-body';

  const userInfo = document.createElement('div');
  userInfo.className = 'nga-popup-user-info';
  userInfo.textContent = `用户: ${options.name || '未知'} (UID: ${options.uid || '未知'})`;
  content.appendChild(userInfo);

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'nga-popup-input';
  input.placeholder = options.placeholder || '';
  input.value = options.defaultValue || '';
  content.appendChild(input);

  const buttons = document.createElement('div');
  buttons.className = 'nga-popup-buttons';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'nga-popup-btn nga-popup-btn-cancel';
  cancelBtn.textContent = '取消';
  buttons.appendChild(cancelBtn);

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'nga-popup-btn nga-popup-btn-save';
  saveBtn.textContent = '保存';
  buttons.appendChild(saveBtn);

  content.appendChild(buttons);
  panel.appendChild(content);
  popup.appendChild(panel);
  document.body.appendChild(popup);

  createIcons({
    icons: { X },
    root: titlebar,
  });

  input.focus();

  const handleSave = () => {
    const value = input.value.trim();
    options.onSave(value);
    destroy();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      destroy();
    } else if (e.key === 'Enter') {
      handleSave();
    }
  };

  const destroy = () => {
    document.removeEventListener('keydown', handleKeyDown);
    popup.remove();
  };

  closeBtn.addEventListener('click', destroy);
  cancelBtn.addEventListener('click', destroy);
  saveBtn.addEventListener('click', handleSave);

  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      destroy();
    }
  });

  document.addEventListener('keydown', handleKeyDown);
};

// ========== 标记弹窗（支持多标签编辑、颜色选择器、备注、历史复用） ==========

const openMarkPopup = (uid: string, name: string) => {
  document.getElementById('nga-custom-popup')?.remove();

  const existingUser = getUserMarks({ uid, name });

  const popup = document.createElement('div');
  popup.id = 'nga-custom-popup';
  popup.className = 'nga-popup-overlay';

  const panel = document.createElement('div');
  panel.className = 'nga-popup-panel nga-popup-panel-wide';

  // 标题栏
  const titlebar = document.createElement('div');
  titlebar.className = 'nga-popup-titlebar';
  const titleText = document.createElement('span');
  titleText.className = 'nga-popup-title-text';
  titleText.textContent = '标记用户';
  titlebar.appendChild(titleText);

  const closeBtn = document.createElement('span');
  closeBtn.className = 'nga-popup-close-btn';
  closeBtn.title = '关闭';
  const closeIcon = document.createElement('i');
  closeIcon.dataset.lucide = 'x';
  closeBtn.appendChild(closeIcon);
  titlebar.appendChild(closeBtn);
  panel.appendChild(titlebar);

  // 弹窗内容
  const body = document.createElement('div');
  body.className = 'nga-popup-body';

  // 用户信息
  const userInfo = document.createElement('div');
  userInfo.className = 'nga-popup-user-info';
  userInfo.textContent = `用户: ${name || '未知'} (UID: ${uid || '未知'})`;
  body.appendChild(userInfo);

  // 标签编辑表格
  const table = document.createElement('table');
  table.className = 'nga-popup-mark-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>标签</th><th>文字色</th><th>背景色</th><th>备注</th><th></th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  tbody.id = 'nga-mark-tbody';
  table.appendChild(tbody);
  body.appendChild(table);

  /** 插入一行标签编辑行 */
  const insertRow = (
    mark = '',
    textColor = '#ffffff',
    bgColor = '#1f72f1',
    desc = '',
    shouldFocus = true,
  ) => {
    const tr = document.createElement('tr');
    // 结构保持静态，用户数据一律通过 DOM 属性写入，避免 HTML 注入
    tr.innerHTML = `
      <td><input type="text" class="nga-mark-input nga-mark-name" placeholder="标签名"></td>
      <td><input type="color" class="nga-popup-color-input"></td>
      <td><input type="color" class="nga-popup-color-input"></td>
      <td><textarea class="nga-popup-desc-input" rows="1" placeholder="可选备注"></textarea></td>
      <td><span class="nga-mark-row-del" title="删除此标签"><i data-lucide="trash-2"></i></span></td>
    `;
    const nameInput = tr.querySelector<HTMLInputElement>('.nga-mark-name');
    const colorInputs = tr.querySelectorAll<HTMLInputElement>('.nga-popup-color-input');
    const descInput = tr.querySelector<HTMLTextAreaElement>('.nga-popup-desc-input');
    if (nameInput) nameInput.value = mark;
    if (colorInputs[0]) colorInputs[0].value = textColor;
    if (colorInputs[1]) colorInputs[1].value = bgColor;
    if (descInput) descInput.value = desc;

    const delBtn = tr.querySelector('.nga-mark-row-del');
    delBtn?.addEventListener('click', () => tr.remove());
    tbody.appendChild(tr);
    createIcons({ icons: { Trash2 }, root: tr });
    if (shouldFocus) {
      nameInput?.focus();
    }
  };

  // 恢复已有标签
  if (existingUser) {
    existingUser.marks.forEach((item) =>
      insertRow(item.mark, item.text_color, item.bg_color, item.desc ?? '', false),
    );
  }

  // 如果没有已有标签，自动添加一行空标签
  if (!existingUser || existingUser.marks.length === 0) {
    insertRow('', '#ffffff', '#1f72f1', '', true);
  }

  // 添加新标签按钮
  const addBtnWrap = document.createElement('div');
  addBtnWrap.className = 'nga-popup-add-row';
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'nga-popup-btn nga-popup-btn-add';
  addBtn.title = '添加新标签';
  const addIcon = document.createElement('i');
  addIcon.dataset.lucide = 'plus';
  addBtn.appendChild(addIcon);
  const addText = document.createTextNode(' 添加新标签');
  addBtn.appendChild(addText);
  addBtn.addEventListener('click', () => insertRow());
  addBtnWrap.appendChild(addBtn);
  body.appendChild(addBtnWrap);
  createIcons({ icons: { Plus }, root: addBtnWrap });

  // 标签历史区域
  if (markedTags.length > 0) {
    const historySection = document.createElement('div');
    historySection.className = 'nga-popup-tag-history';
    const historyTitle = document.createElement('div');
    historyTitle.className = 'nga-popup-tag-history-title';
    historyTitle.textContent = '选择已添加过的标签';
    historySection.appendChild(historyTitle);

    const historyContent = document.createElement('div');
    historyContent.className = 'nga-popup-tag-history-content';
    markedTags.forEach((tag) => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'nga-popup-tag-history-item';
      tagSpan.textContent = `${tag.mark} (${tag.count})`;
      tagSpan.title = tag.mark;
      tagSpan.style.color = tag.text_color;
      tagSpan.style.backgroundColor = tag.bg_color;
      tagSpan.addEventListener('click', () => {
        insertRow(tag.mark, tag.text_color, tag.bg_color, tag.desc ?? '', false);
      });
      historyContent.appendChild(tagSpan);
    });
    historySection.appendChild(historyContent);
    body.appendChild(historySection);
  }

  // 底部按钮
  const buttons = document.createElement('div');
  buttons.className = 'nga-popup-buttons';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'nga-popup-btn nga-popup-btn-cancel';
  cancelBtn.textContent = '取消';
  buttons.appendChild(cancelBtn);

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'nga-popup-btn nga-popup-btn-save';
  saveBtn.textContent = '保存';
  buttons.appendChild(saveBtn);

  body.appendChild(buttons);
  panel.appendChild(body);
  popup.appendChild(panel);
  document.body.appendChild(popup);

  createIcons({ icons: { X }, root: titlebar });

  const handleSave = () => {
    const rows = tbody.querySelectorAll('tr');
    const marks: UserMark[] = [];
    rows.forEach((row) => {
      const markName =
        (row.querySelector('.nga-mark-name') as HTMLInputElement | null)?.value.trim() ?? '';
      const textColor =
        (row.querySelectorAll('.nga-popup-color-input')[0] as HTMLInputElement | null)?.value ??
        '#000';
      const bgColor =
        (row.querySelectorAll('.nga-popup-color-input')[1] as HTMLInputElement | null)?.value ??
        '#ffd966';
      const descVal =
        (row.querySelector('.nga-popup-desc-input') as HTMLTextAreaElement | null)?.value.trim() ??
        '';
      if (markName) {
        marks.push({
          mark: markName,
          text_color: textColor,
          bg_color: bgColor,
          desc: descVal || undefined,
        });
      }
    });

    // 查找现有用户并更新
    const existIdx = markList.findIndex(
      (v) => (v.uid && uid && v.uid === uid) || (v.name && name && v.name === name),
    );

    if (existIdx > -1) {
      if (marks.length === 0) {
        // 标签全部删除，移除该用户
        markList.splice(existIdx, 1);
      } else {
        markList[existIdx] = { uid, name, marks };
      }
    } else if (marks.length > 0) {
      markList.push({ uid, name, marks });
    }

    void saveMarkList().then(() => window.location.reload());
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') destroy();
  };

  const destroy = () => {
    document.removeEventListener('keydown', handleKeyDown);
    popup.remove();
  };

  closeBtn.addEventListener('click', destroy);
  cancelBtn.addEventListener('click', destroy);
  saveBtn.addEventListener('click', handleSave);
  popup.addEventListener('click', (e) => {
    if (e.target === popup) destroy();
  });
  document.addEventListener('keydown', handleKeyDown);
};

const openBanPopup = (uid: string, name: string) => {
  showSimplePopup({
    title: '拉黑用户',
    uid,
    name,
    placeholder: '拉黑备注，留空表示不添加备注',
    onSave: (desc) => {
      if (!getBanUser({ uid, name })) {
        banList.push({ uid, name, desc: desc.trim() || undefined });
        void saveBanList().then(() => window.location.reload());
      }
    },
  });
};

const renderOperationButtons = ($el: HTMLElement, user: UserIdentity) => {
  const container = $el.querySelector('.posterInfoLine, .postinfob');
  if (!container || container.querySelector('.nga-icon-mark')) return;

  const markButton = document.createElement('a');
  markButton.href = 'javascript:void(0)';
  markButton.className = 'nga-icon-mark nga-icon-btn';
  markButton.title = '标记该用户';
  const markIcon = document.createElement('i');
  markIcon.dataset.lucide = 'tag';
  markButton.appendChild(markIcon);
  markButton.addEventListener('click', (event) => {
    event.stopPropagation();
    event.preventDefault();
    openMarkPopup(user.uid, user.name);
  });
  container.appendChild(markButton);

  const banButton = document.createElement('a');
  banButton.href = 'javascript:void(0)';
  banButton.className = 'nga-icon-ban nga-icon-btn';
  banButton.title = '拉黑该用户';
  const banIcon = document.createElement('i');
  banIcon.dataset.lucide = 'ban';
  banButton.appendChild(banIcon);
  banButton.addEventListener('click', (event) => {
    event.stopPropagation();
    event.preventDefault();
    openBanPopup(user.uid, user.name);
  });
  container.appendChild(banButton);

  createIcons({
    icons: { Tag, Ban },
    root: container as HTMLElement,
  });
};

const applyPostBan = ($el: HTMLElement, banUser: BanUser, mode: BanMode) => {
  if ($el.dataset.bannedProcessed) return true;
  $el.dataset.bannedProcessed = 'true';

  if (mode === 'REMOVE' || mode === 'ALL') {
    $el.remove();
    return false;
  }

  const postContent = $el.querySelector('.c2 .postcontent, .postcontent');
  if (postContent instanceof HTMLElement) {
    postContent.style.display = 'none';
    postContent.insertAdjacentElement('afterend', createBannedBlock(banUser, postContent));
  }

  return true;
};

const applyCommentBan = (comment: HTMLElement, banUser: BanUser, mode: BanMode) => {
  if (comment.dataset.bannedProcessed) return;
  comment.dataset.bannedProcessed = 'true';

  if (mode === 'ALL') {
    comment.remove();
    return;
  }

  const content = comment.querySelector('.ubbcode');
  if (!(content instanceof HTMLElement)) return;

  if (mode === 'REMOVE') {
    content.replaceChildren();
    const deleted = document.createElement('div');
    deleted.className = 'nga-banned';
    deleted.textContent = '此用户在你的黑名单中，已删除其言论';
    if (banUser.desc) {
      const desc = document.createElement('div');
      desc.textContent = `备注: ${banUser.desc}`;
      deleted.appendChild(desc);
    }
    content.appendChild(deleted);
    return;
  }

  content.style.display = 'none';
  content.insertAdjacentElement('afterend', createBannedBlock(banUser, content));
};

/**
 * 处理引用区域中被拉黑用户的内容
 * 遍历非 author、非评论区的 a.userlink，匹配后屏蔽其父级引用区域
 */
const applyQuoteBan = ($el: HTMLElement, mode: BanMode) => {
  // 找到帖子正文区域内所有引用中的用户链接
  const postContent = $el.querySelector('.c2 .postcontent, .postcontent');
  if (!postContent) return;

  const quoteLinks = postContent.querySelectorAll('.quote a.userlink');
  for (const link of quoteLinks) {
    if (!(link instanceof HTMLAnchorElement)) continue;
    // 跳过已处理的
    const quoteContainer = link.closest('.quote');
    if (!quoteContainer || (quoteContainer as HTMLElement).dataset.quoteBanProcessed) continue;

    const user = getUserFromLink(link);
    if (!user) continue;

    const banUser = getBanUser(user);
    if (!banUser) continue;

    // 级联删除：回复被拉黑用户的楼层/评论一并删除
    if (mode === 'ALL') {
      const commentEl = link.closest('.comment_c');
      if (commentEl) {
        commentEl.remove();
      } else {
        $el.remove();
        return;
      }
      continue;
    }

    const quoteEl = quoteContainer as HTMLElement;
    quoteEl.dataset.quoteBanProcessed = 'true';

    if (mode === 'REMOVE') {
      quoteEl.innerHTML = '';
      const deleted = document.createElement('div');
      deleted.className = 'nga-banned';
      deleted.textContent = '此用户在你的黑名单中，已删除其引用内容';
      if (banUser.desc) {
        const desc = document.createElement('div');
        desc.textContent = `备注: ${banUser.desc}`;
        deleted.appendChild(desc);
      }
      quoteEl.appendChild(deleted);
      continue;
    }

    // HIDE 模式：隐藏内容，点击展开
    // 保存原始内容，替换为提示块
    const originalDisplay = quoteEl.style.display;
    const wrapper = document.createElement('div');
    // 将 quote 内容移到隐藏 wrapper 中
    while (quoteEl.firstChild) {
      wrapper.appendChild(quoteEl.firstChild);
    }
    wrapper.style.display = 'none';
    quoteEl.appendChild(wrapper);

    const block = document.createElement('div');
    block.className = 'nga-banned nga-banned-block';
    block.textContent = '引用中的用户在你的黑名单中，已屏蔽，点击查看';
    if (banUser.desc) {
      const desc = document.createElement('div');
      desc.textContent = `备注: ${banUser.desc}`;
      block.appendChild(desc);
    }
    block.addEventListener('click', () => {
      block.remove();
      wrapper.style.display = originalDisplay || '';
    });
    quoteEl.insertBefore(block, wrapper);
  }
};

export const MarkAndBanModule: NGA_Module = {
  name: 'MarkAndBan',

  async initFunc(app: NGABBSScript) {
    if (!app.setting.normal.markAndBan) return;

    const styleEl = document.createElement('style');
    styleEl.textContent = _style_MarkAndBan;
    document.head.appendChild(styleEl);
    banList = parseBanList(await Storage.get<string>('nga-ban-list'));
    markList = parseMarkList(await Storage.get<string>('nga-mark-list'));

    // 统计标签使用历史
    markedTags = buildMarkedTags();
  },

  renderThreadsFunc($el: HTMLElement, app: NGABBSScript) {
    if (!app.setting.normal.markAndBan || banList.length === 0) return;

    const authorLink = $el.querySelector('.author');
    const user = getUserFromLink(authorLink);
    if (!user) return;

    const banUser = getBanUser(user);
    if (!banUser) return;

    const title = $el.querySelector('.c2 > a')?.textContent?.trim() ?? '';
    app.printLog(`Ban list hit in thread list. uid=${user.uid} name=${user.name} title=${title}`);
    $el.closest('tbody')?.remove();
    $el.remove();
  },

  renderFormsFunc($el: HTMLElement, app: NGABBSScript) {
    if (!app.setting.normal.markAndBan) return;

    const mode = app.setting.advanced.banStrictMode;
    const postUser = getPostAuthor($el);
    if (!postUser) return;

    const postBanUser = getBanUser(postUser);
    if (postBanUser && !applyPostBan($el, postBanUser, mode)) return;

    const uidAnchor = $el.querySelector('a[name="uid"]');
    renderMarks(uidAnchor, postUser);
    renderOperationButtons($el, postUser);

    // 处理评论区
    $el.querySelectorAll('.comment_c').forEach((commentEl) => {
      if (!(commentEl instanceof HTMLElement)) return;

      const commentUser = getUserFromLink(commentEl.querySelector('a.userlink'));
      if (!commentUser) return;

      const commentBanUser = getBanUser(commentUser);
      if (commentBanUser) {
        applyCommentBan(commentEl, commentBanUser, mode);
      }
      renderMarks(commentEl.querySelector('a.userlink'), commentUser);
    });

    // 处理引用区域中被拉黑用户的内容
    applyQuoteBan($el, mode);
  },
};
