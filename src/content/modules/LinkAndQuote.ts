import _style_LinkAndQuote from './LinkAndQuote.scss?inline';
import type { NGA_Module, NGABBSScript } from '../core/app';

export const LinkAndQuoteModule: NGA_Module = {
  initFunc(app: NGABBSScript) {
    if (app.setting.normal.foldQuote) {
      const styleEl = document.createElement('style');
      styleEl.textContent = _style_LinkAndQuote;
      document.head.appendChild(styleEl);
    }
  },

  name: 'LinkAndQuote',

  renderFormsFunc($el: HTMLElement, app: NGABBSScript) {
    // DirectLinkJump
    if (app.setting.normal.directLinkJump) {
      $el.querySelectorAll('a[onclick]').forEach((el) => {
        const onClickAttr = el.getAttribute('onclick');
        if (onClickAttr && onClickAttr.includes('showUrlAlert')) {
          el.removeAttribute('onclick');
          el.removeAttribute('onmouseover');
          el.removeAttribute('onmouseout');
        }
      });
    }

    // 自动折叠过长引用
    if (app.setting.normal.foldQuote) {
      const foldHeight = app.setting.advanced.foldQuoteHeight || 300;
      $el.querySelectorAll('.postcontent .quote').forEach((el) => {
        const $quote = el as HTMLElement;
        if ($quote.offsetHeight > foldHeight) {
          const originalHeight = $quote.offsetHeight;
          $quote.classList.add('nga-quote-fold');

          const currentFoldHeight = $quote.offsetHeight;
          const percent = 100 - Math.floor((currentFoldHeight / originalHeight) * 100);

          const btnBox = document.createElement('div');
          btnBox.className = 'nga-quote-box';

          const btn = document.createElement('button');
          btn.textContent = `查看全部 (剩余${percent}%)`;

          btn.addEventListener('click', () => {
            btnBox.remove();
            $quote.classList.remove('nga-quote-fold');
          });

          btnBox.appendChild(btn);
          $quote.appendChild(btnBox);
        }
      });

      // 折叠附件
      $el.querySelectorAll('h4.silver.subtitle').forEach((el) => {
        const h4 = el as HTMLElement;
        if (h4.innerHTML === '附件' && h4.nextElementSibling?.id.includes('postattach')) {
          const attachDiv = h4.nextElementSibling as HTMLElement;
          attachDiv.style.display = 'none';

          const openBtn = document.createElement('button');
          openBtn.textContent = '显示附件';
          openBtn.style.margin = '5px 0';
          openBtn.addEventListener('click', () => {
            openBtn.remove();
            attachDiv.style.display = 'block';
          });

          h4.insertAdjacentElement('afterend', openBtn);
        }
      });
    }
  },

  renderThreadsFunc($el: HTMLElement, app: NGABBSScript) {
    // LinkTargetBlank
    if (app.setting.normal.linkTargetBlank) {
      const topicLink = $el.querySelector('.topic') as HTMLAnchorElement;
      if (topicLink) {
        const href = topicLink.getAttribute('href');
        if (href) {
          topicLink.setAttribute('data-href', href);
          topicLink.setAttribute('href', 'javascript:void(0)');
          topicLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(href);
          });
        }
      }
    }
  },
};
