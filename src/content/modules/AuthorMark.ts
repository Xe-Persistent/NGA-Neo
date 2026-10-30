import type { NGA_Module, NGABBSScript } from '../core/app';
import { Storage } from '../core/storage';
import { normalizeName } from '@/lib/guards';

let postAuthors: string[] = [];

const getQueryString = (name: string, urlStr = window.location.href) => {
  try {
    const url = new URL(urlStr.replace(/&amp;/g, '&'));
    return url.searchParams.get(name);
  } catch {
    const reg = new RegExp('(?:\\?|&)' + name + '=([^&]*)(&|$)');
    const result = decodeURIComponent(urlStr.replace(/&amp;/g, '&')).match(reg);
    return result?.[1] ?? null;
  }
};

const rememberCurrentAuthor = () => {
  const author = normalizeName(document.getElementById('postauthor0')?.textContent ?? '');
  const tid = getQueryString('tid');
  if (
    !author ||
    !tid ||
    window.location.href.includes('authorid=') ||
    window.location.href.includes('pid=')
  ) {
    return;
  }

  const authorKey = `${tid}:${author}`;
  if (postAuthors.includes(authorKey)) return;

  postAuthors.unshift(authorKey);
  if (postAuthors.length > 10) postAuthors.pop();
  void Storage.set('nga-post-author', postAuthors.join(','));
};

export const AuthorMarkModule: NGA_Module = {
  name: 'AuthorMark',

  async initFunc(app: NGABBSScript) {
    const localPostAuthor = await Storage.get<string>('nga-post-author');
    postAuthors = localPostAuthor ? localPostAuthor.split(',').filter(Boolean) : [];

    const color = app.setting.advanced.authorMarkColor || '#F00';
    const css = `
      .nga-post-author {
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
    const styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  },

  renderFormsFunc($el: HTMLElement, app: NGABBSScript) {
    if (!app.setting.normal.authorMark) return;

    rememberCurrentAuthor();

    const tid = getQueryString('tid');
    if (!tid) return;

    $el.querySelectorAll('a.userlink').forEach((el) => {
      const a = el as HTMLAnchorElement;
      if (a.nextElementSibling?.classList.contains('nga-post-author')) return;

      const name = normalizeName(a.getAttribute('nga-mark-before-name') || a.textContent || '');
      if (!name || !postAuthors.includes(`${tid}:${name}`)) return;

      const span = document.createElement('span');
      span.className = 'nga-post-author';
      span.textContent = '楼主';
      a.insertAdjacentElement('afterend', span);
    });
  },
};
