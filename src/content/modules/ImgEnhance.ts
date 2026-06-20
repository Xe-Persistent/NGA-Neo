import { NGA_Module, NGABBSScript } from "../core/app";

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

const VIEWER_ID = "hld__img_full";
const MIN_VIEWER_SIZE = 50;
const ZOOM_STEP = 0.2;

const isSmileImage = (img: HTMLImageElement) => img.className.includes("smile");

const getImageUrl = (img: HTMLImageElement) =>
  img.dataset.srcorg ||
  img.dataset.srclazy ||
  img.currentSrc ||
  img.getAttribute("src")?.replace(".medium.jpg", "") ||
  "";

const collectImages = (current: HTMLImageElement): ImageItem[] => {
  const scope = current.closest(".postcontent") ?? current.parentElement;
  const images = scope?.querySelectorAll<HTMLImageElement>("img[hld__imglist='ready']") ?? [];

  return Array.from(images)
    .map((element) => ({ element, url: getImageUrl(element) }))
    .filter((item) => item.url && item.url !== "about:blank");
};

const createButton = (className: string, text: string, title: string) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `change ${className}`;
  button.textContent = text;
  button.title = title;
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
  image.style.width = "";
  image.style.height = "";

  if (image.naturalWidth >= image.naturalHeight) {
    image.style.width = "100%";
    image.style.height = "auto";
  } else {
    image.style.height = "100%";
    image.style.width = "auto";
  }
};

const renderImage = (
  state: ViewerState,
  image: HTMLImageElement,
  container: HTMLElement,
  loader: HTMLElement
) => {
  const item = state.items[state.index];
  if (!item) return;

  state.rotation = 0;
  setInitialBox(state, container);
  image.style.transform = "";
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
    items.findIndex((item) => item.element === current)
  );
  const state: ViewerState = {
    items,
    index: currentIndex,
    rotation: 0,
    size: 0,
    left: 0,
    top: 0
  };

  const overlay = document.createElement("div");
  overlay.id = VIEWER_ID;
  overlay.title = "点击背景关闭";

  const loader = document.createElement("div");
  loader.id = "loader";
  overlay.appendChild(loader);

  const container = document.createElement("div");
  container.className = "hld__img_container hld__zoom-target";

  const image = document.createElement("img");
  image.className = "hld__img hld__zoom-target";
  image.title = "鼠标滚轮放大/缩小\n左键拖动移动";
  container.appendChild(image);
  overlay.appendChild(container);

  const controls = document.createElement("div");
  controls.className = "hld__if_control";
  const prevButton = createButton("prev-img", "上一张", "本楼内上一张");
  const rotateLeftButton = createButton("rotate-left", "左旋", "逆时针旋转90°");
  const rotateRightButton = createButton("rotate-right", "右旋", "顺时针旋转90°");
  const nextButton = createButton("next-img", "下一张", "本楼内下一张");
  controls.append(prevButton, rotateLeftButton, rotateRightButton, nextButton);
  overlay.appendChild(controls);

  prevButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (state.index > 0) {
      state.index -= 1;
      renderImage(state, image, container, loader);
    }
    clearSelection();
  });

  nextButton.addEventListener("click", (event) => {
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

  rotateLeftButton.addEventListener("click", (event) => {
    event.stopPropagation();
    rotate(-90);
  });

  rotateRightButton.addEventListener("click", (event) => {
    event.stopPropagation();
    rotate(90);
  });

  overlay.addEventListener("click", (event) => {
    if (event.target !== image && event.target !== container) {
      overlay.remove();
    }
  });

  overlay.addEventListener(
    "wheel",
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
    { passive: false }
  );

  image.addEventListener("pointerdown", (event) => {
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
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", cleanup);
      document.removeEventListener("pointercancel", cleanup);
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", cleanup);
    document.addEventListener("pointercancel", cleanup);
  });

  document.body.appendChild(overlay);
  renderImage(state, image, container, loader);
};

export const ImgEnhanceModule: NGA_Module = {
  name: "ImgEnhance",
  title: "图片增强",

  renderFormsFunc($el: HTMLElement, app: NGABBSScript) {
    $el.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
      if (isSmileImage(img)) return;

      img.setAttribute("hld__imglist", "ready");
      img.removeAttribute("onload");
      img.removeAttribute("onclick");

      if (!app.setting.normal.imgEnhance || img.dataset.hldImgEnhanceBound) return;
      img.dataset.hldImgEnhanceBound = "true";
      img.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openViewer(img);
      });
    });
  },

  style: `
    .postcontent img { margin: 0 5px 5px 0 !important; box-shadow: none !important; outline: none !important; max-height: none !important; }
    .postcontent img[hld__imglist='ready'] { cursor: zoom-in; }
    #hld__img_full { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); z-index: 99999; }
    #hld__img_full #loader { position: absolute; top: 50%; left: 50%; width: 36px; height: 36px; margin: -18px 0 0 -18px; border: 3px solid rgba(255, 255, 255, 0.4); border-top-color: #fff; border-radius: 50%; animation: hld-img-loader 0.8s linear infinite; }
    .hld__img_container { position: absolute; display: flex; justify-content: center; align-items: center; }
    #hld__img_full img { cursor: move; transition: transform 0.2s ease; user-select: none; }
    .hld__if_control { position: absolute; display: flex; left: 50%; bottom: 15px; transform: translateX(-50%); height: 40px; background: rgba(0, 0, 0, 0.65); z-index: 9999999; }
    #hld__img_full .change { min-width: 48px; height: 40px; padding: 0 10px; color: #fff; background: transparent; border: 0; border-left: 1px solid rgba(255, 255, 255, 0.18); cursor: pointer; }
    #hld__img_full .change:first-child { border-left: 0; }
    #hld__img_full .change:hover { background: rgba(255, 255, 255, 0.16); }
    @keyframes hld-img-loader { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
  `
};
