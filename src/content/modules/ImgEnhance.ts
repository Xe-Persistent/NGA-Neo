import _style_ImgEnhance from './ImgEnhance.scss?inline';
import { createIcons, ChevronLeft, ChevronRight, RotateCcw, RotateCw } from 'lucide';
import type { NGA_Module, NGABBSScript } from '../core/app';

interface ImageItem {
  element: HTMLImageElement;
  url: string;
}

interface ViewerState {
  items: ImageItem[];
  index: number;
  rotation: number;
  size: number;
  left: number;
  top: number;
}

const VIEWER_ID = 'nga-img-full';
const MIN_VIEWER_SIZE = 50;
const ZOOM_STEP = 0.2;

const isSmileImage = (img: HTMLImageElement) => img.className.includes('smile');

const getImageUrl = (img: HTMLImageElement) =>
  img.dataset.srcorg ||
  img.dataset.srclazy ||
  img.currentSrc ||
  img.getAttribute('src')?.replace('.medium.jpg', '') ||
  '';

const collectImages = (current: HTMLImageElement): ImageItem[] => {
  const scope = current.closest('.postcontent') ?? current.parentElement;
  const images = scope?.querySelectorAll<HTMLImageElement>("img[nga-imglist='ready']") ?? [];

  return Array.from(images)
    .map((element) => ({ element, url: getImageUrl(element) }))
    .filter((item) => item.url && item.url !== 'about:blank');
};

const createButton = (className: string, iconName: string, title: string) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `change ${className}`;
  button.title = title;

  const icon = document.createElement('i');
  icon.dataset.lucide = iconName;
  button.appendChild(icon);
  return button;
};

const setInitialBox = (state: ViewerState, container: HTMLElement) => {
  const size = Math.round(window.innerHeight * 0.85);
  state.size = size;
  state.left = Math.round((window.innerWidth - size) / 2);
  state.top = Math.round(window.innerHeight * 0.03);

  container.style.width = `${state.size}px`;
  container.style.height = `${state.size}px`;
  container.style.left = `${state.left}px`;
  container.style.top = `${state.top}px`;
};

const applyBox = (state: ViewerState, container: HTMLElement) => {
  container.style.width = `${state.size}px`;
  container.style.height = `${state.size}px`;
  container.style.left = `${state.left}px`;
  container.style.top = `${state.top}px`;
};

const fitImage = (image: HTMLImageElement) => {
  image.style.width = '';
  image.style.height = '';

  if (image.naturalWidth >= image.naturalHeight) {
    image.style.width = '100%';
    image.style.height = 'auto';
  } else {
    image.style.height = '100%';
    image.style.width = 'auto';
  }
};

const renderImage = (
  state: ViewerState,
  image: HTMLImageElement,
  container: HTMLElement,
  loader: HTMLElement,
) => {
  const item = state.items[state.index];
  if (!item) return;

  state.rotation = 0;
  setInitialBox(state, container);
  image.style.transform = '';
  image.hidden = true;
  loader.hidden = false;

  image.onload = () => {
    fitImage(image);
    image.hidden = false;
    loader.hidden = true;
  };
  image.src = item.url;
};

const clearSelection = () => {
  window.getSelection()?.removeAllRanges();
};

const openViewer = (current: HTMLImageElement) => {
  if (document.getElementById(VIEWER_ID)) return;

  const items = collectImages(current);
  if (items.length === 0) return;

  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.element === current),
  );
  const state: ViewerState = {
    items,
    index: currentIndex,
    rotation: 0,
    size: 0,
    left: 0,
    top: 0,
  };

  const overlay = document.createElement('div');
  overlay.id = VIEWER_ID;
  overlay.title = '点击背景关闭';

  const loader = document.createElement('div');
  loader.id = 'loader';
  overlay.appendChild(loader);

  const container = document.createElement('div');
  container.className = 'nga-img-container nga-zoom-target';

  const image = document.createElement('img');
  image.className = 'nga-img nga-zoom-target';
  image.title = '鼠标滚轮放大/缩小\n左键拖动移动';
  container.appendChild(image);
  overlay.appendChild(container);

  const controls = document.createElement('div');
  controls.className = 'nga-if-control';
  const prevButton = createButton('prev-img', 'chevron-left', '上一张 (本楼内上一张)');
  const rotateLeftButton = createButton('rotate-left', 'rotate-ccw', '逆时针旋转90°');
  const rotateRightButton = createButton('rotate-right', 'rotate-cw', '顺时针旋转90°');
  const nextButton = createButton('next-img', 'chevron-right', '下一张 (本楼内下一张)');
  controls.append(prevButton, rotateLeftButton, rotateRightButton, nextButton);
  overlay.appendChild(controls);

  createIcons({
    icons: { ChevronLeft, ChevronRight, RotateCcw, RotateCw },
    root: controls,
  });

  prevButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (state.index > 0) {
      state.index -= 1;
      renderImage(state, image, container, loader);
    }
    clearSelection();
  });

  nextButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (state.index + 1 < state.items.length) {
      state.index += 1;
      renderImage(state, image, container, loader);
    }
    clearSelection();
  });

  const rotate = (deg: number) => {
    state.rotation = (state.rotation + deg) % 360;
    image.style.transform = `rotate(${state.rotation}deg)`;
    clearSelection();
  };

  rotateLeftButton.addEventListener('click', (event) => {
    event.stopPropagation();
    rotate(-90);
  });

  rotateRightButton.addEventListener('click', (event) => {
    event.stopPropagation();
    rotate(90);
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') destroyViewer();
  };

  const destroyViewer = () => {
    document.removeEventListener('keydown', handleKeyDown);
    overlay.remove();
  };

  document.addEventListener('keydown', handleKeyDown);

  overlay.addEventListener('click', (event) => {
    if (event.target !== image && event.target !== container) {
      destroyViewer();
    }
  });

  overlay.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      const delta = event.deltaY < 0 ? 1 : -1;
      if (state.size <= MIN_VIEWER_SIZE && delta < 0) return;

      const rect = container.getBoundingClientRect();
      const offset = state.size * ZOOM_STEP;
      const nextSize = Math.max(MIN_VIEWER_SIZE, state.size + offset * delta);
      const ratioX = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0.5;
      const ratioY = rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0.5;
      const sizeDiff = nextSize - state.size;

      state.left -= sizeDiff * ratioX;
      state.top -= sizeDiff * ratioY;
      state.size = nextSize;
      applyBox(state, container);
    },
    { passive: false },
  );

  image.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    image.setPointerCapture(event.pointerId);

    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = state.left;
    const startTop = state.top;

    const onPointerMove = (moveEvent: PointerEvent) => {
      state.left = startLeft + moveEvent.clientX - startX;
      state.top = startTop + moveEvent.clientY - startY;
      applyBox(state, container);
    };

    const cleanup = () => {
      image.releasePointerCapture(event.pointerId);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', cleanup);
      document.removeEventListener('pointercancel', cleanup);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', cleanup);
    document.addEventListener('pointercancel', cleanup);
  });

  document.body.appendChild(overlay);
  renderImage(state, image, container, loader);
};

export const ImgEnhanceModule: NGA_Module = {
  name: 'ImgEnhance',

  initFunc(app: NGABBSScript) {
    if (!app.setting.normal.imgEnhance) return;
    const styleEl = document.createElement('style');
    styleEl.textContent = _style_ImgEnhance;
    document.head.appendChild(styleEl);
  },

  renderFormsFunc($el: HTMLElement, app: NGABBSScript) {
    $el.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
      if (isSmileImage(img)) return;

      img.setAttribute('nga-imglist', 'ready');
      img.removeAttribute('onload');
      img.removeAttribute('onclick');

      if (!app.setting.normal.imgEnhance || img.dataset.ngaImgEnhanceBound) return;
      img.dataset.ngaImgEnhanceBound = 'true';
      img.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openViewer(img);
      });
    });
  },
};
