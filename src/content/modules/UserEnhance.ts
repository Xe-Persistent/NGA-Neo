import _style_UserEnhance from './UserEnhance.scss?inline';
import type { NGA_Module, NGABBSScript } from '../core/app';
import { NGA_Bridge } from '../core/bridge';
import { Storage } from '../core/storage';
import { isRecord, parseJson } from '@/lib/guards';

interface NgaUserInfo {
  regdate: number;
  postnum: number;
}

type NgaUserMap = Record<string, NgaUserInfo | undefined>;

interface RemoteUserInfo {
  ipLoc: string;
  queryTime: number;
}

const USER_INFO_CACHE_PREFIX = 'nga-user-remote-info-';
const CACHE_TTL_SECONDS = 7 * 24 * 3600;

let pageUsersPromise: Promise<NgaUserMap | null> | null = null;

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const getPageUsers = async (): Promise<NgaUserMap | null> => {
  pageUsersPromise ??= NGA_Bridge.getGlobalVar<unknown>('commonui.userInfo.users').then((value) => {
    if (!isRecord(value)) return null;

    const users: NgaUserMap = {};
    Object.entries(value).forEach(([uid, rawUser]) => {
      if (!isRecord(rawUser)) return;

      const regdate = toNumber(rawUser.regdate);
      const postnum = toNumber(rawUser.postnum);
      if (regdate === null || postnum === null) return;

      users[uid] = { regdate, postnum };
    });

    return users;
  });

  return pageUsersPromise;
};

const nowSeconds = () => Math.ceil(Date.now() / 1000);

const parseRemoteUserInfo = (payload: unknown): RemoteUserInfo | null => {
  if (!isRecord(payload)) return null;

  const data = payload.data;
  if (!Array.isArray(data) || data.length === 0 || !isRecord(data[0])) return null;

  const ipLoc = data[0].ipLoc;
  if (typeof ipLoc !== 'string' || !ipLoc.trim()) return null;

  const responseTime = toNumber(payload.time) ?? nowSeconds();
  return {
    ipLoc,
    queryTime: responseTime,
  };
};

const parseCachedRemoteUserInfo = (cacheValue: string | null): RemoteUserInfo | null => {
  if (!cacheValue) return null;

  try {
    const parsed = parseJson(cacheValue);
    if (!isRecord(parsed)) return null;

    const ipLoc = parsed.ipLoc;
    const queryTime = toNumber(parsed.queryTime);
    if (typeof ipLoc !== 'string' || queryTime === null) return null;
    if (nowSeconds() - queryTime > CACHE_TTL_SECONDS) return null;

    return { ipLoc, queryTime };
  } catch {
    return null;
  }
};

const getRemoteUserInfo = async (uid: number): Promise<RemoteUserInfo> => {
  const cacheKey = `${USER_INFO_CACHE_PREFIX}${uid}`;
  const cached = parseCachedRemoteUserInfo(await Storage.get<string>(cacheKey));
  if (cached) return cached;

  const response = await fetch(
    `https://${window.location.host}/nuke.php?__output=11&__act=get&__lib=ucp&uid=${uid}`,
    { credentials: 'include' },
  );
  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`);
  }

  const json: unknown = await response.json();
  const remoteInfo = parseRemoteUserInfo(json);
  if (!remoteInfo) {
    throw new Error('EMPTY_RESPONSE');
  }

  await Storage.set(cacheKey, JSON.stringify(remoteInfo));
  return remoteInfo;
};

const parseUid = ($el: HTMLElement): number | null => {
  const uidText = $el.querySelector('a[name="uid"]')?.textContent;
  const uid = toNumber(uidText);
  if (uid === null || uid <= 0) return null;
  return uid;
};

const setLocationText = (target: HTMLElement, text: string, retryable: boolean) => {
  target.className = retryable ? 'userval numeric nga-req-retry' : 'userval numeric';
  target.textContent = text;
};

const bindLocationLoader = (target: HTMLElement, uid: number) => {
  target.addEventListener('click', () => {
    if (!target.classList.contains('nga-req-retry')) return;

    target.className = 'userval numeric loading';
    target.textContent = '';

    getRemoteUserInfo(uid)
      .then((remoteInfo) => {
        target.closest('.nga-user-location')?.setAttribute('title', `IP属地: ${remoteInfo.ipLoc}`);
        setLocationText(target, remoteInfo.ipLoc, false);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'UNKNOWN';
        setLocationText(target, `获取失败(${message})，点击重试`, true);
      });
  });
};

const renderUserEnhance = async ($el: HTMLElement) => {
  const uid = parseUid($el);
  if (uid === null || $el.querySelector(`.nga-user-enhance-${uid}`)) return;

  const pageUsers = await getPageUsers();
  const userInfo = pageUsers?.[String(uid)];
  if (!userInfo || !$el.isConnected) return;

  const regSeconds = nowSeconds() - userInfo.regdate;
  const regDays = Math.round(regSeconds / 3600 / 24);
  const regYear = (regSeconds / 3600 / 24 / 365).toFixed(1);

  const regDiv = document.createElement('div');
  regDiv.className = `nga-user-enhance-${uid}`;
  const regSpan = document.createElement('span');
  regSpan.title = `注册天数: ${regDays}天\n注册年数: ${regYear}年`;
  regSpan.append('坛龄: ');
  const regValue = document.createElement('span');
  regValue.className = 'numeric userval';
  regValue.setAttribute('name', 'regday');
  regValue.textContent = `${regDays}天`;
  regSpan.appendChild(regValue);
  regDiv.appendChild(regSpan);

  const postDiv = document.createElement('div');
  postDiv.className = `nga-user-enhance-${uid}`;
  const postSpan = document.createElement('span');
  postSpan.title = `发帖数量: ${userInfo.postnum}`;
  postSpan.append('发帖: ');
  const postValue = document.createElement('span');
  postValue.className = 'numeric userval';
  postValue.setAttribute('name', 'postnum');
  postValue.textContent = String(userInfo.postnum);
  postSpan.appendChild(postValue);
  postDiv.appendChild(postSpan);

  const locationDiv = document.createElement('div');
  locationDiv.className = `nga-user-enhance-${uid}`;
  const locationSpan = document.createElement('span');
  locationSpan.className = 'nga-user-location';
  locationSpan.textContent = '属地: ';
  const locationValue = document.createElement('span');
  setLocationText(locationValue, '点击获取', true);
  bindLocationLoader(locationValue, uid);
  locationSpan.appendChild(locationValue);
  locationDiv.appendChild(locationSpan);

  const container = document.createElement('div');
  container.className = `nga-user-enhance nga-user-enhance-${uid}`;
  container.append(regDiv, postDiv, locationDiv);

  const stat = $el.querySelector('.posterinfo div.stat, .posterInfo div.stat');
  const clickExtend = stat?.querySelector('.clickextend');

  if (clickExtend?.parentElement) {
    const anchor = clickExtend.parentElement.firstElementChild;
    if (anchor) {
      anchor.insertAdjacentElement('afterend', container);
    } else {
      clickExtend.parentElement.append(container);
    }
  } else if (stat) {
    stat.append(container);
  }

  const cached = parseCachedRemoteUserInfo(
    await Storage.get<string>(`${USER_INFO_CACHE_PREFIX}${uid}`),
  );
  if (cached) {
    locationSpan.title = `IP属地: ${cached.ipLoc}`;
    setLocationText(locationValue, cached.ipLoc, false);
  }
};

export const UserEnhanceModule: NGA_Module = {
  initFunc(app: NGABBSScript) {
    if (app.setting.normal.userEnhance) {
      const styleEl = document.createElement('style');
      styleEl.textContent = _style_UserEnhance;
      document.head.appendChild(styleEl);
    }
  },

  name: 'UserEnhance',

  renderFormsFunc($el: HTMLElement, app: NGABBSScript) {
    if (!app.setting.normal.userEnhance) return;
    void renderUserEnhance($el);
  },
};
