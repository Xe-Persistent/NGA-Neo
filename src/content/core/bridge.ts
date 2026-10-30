import { isRecord } from '@/lib/guards';

const createRequestId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const NGA_Bridge = {
  /**
   * 异步获取页面级变量 (替代 unsafeWindow.var)
   */
  async getGlobalVar<T>(key: string): Promise<T | null> {
    return new Promise((resolve) => {
      const reqId = createRequestId();
      const handler = (event: MessageEvent<unknown>) => {
        const data = event.data;
        if (
          isRecord(data) &&
          data.type === 'NGA_GLOBAL_RES' &&
          data.key === key &&
          data.reqId === reqId
        ) {
          window.removeEventListener('message', handler);
          resolve((data.value as T) ?? null);
        }
      };
      window.addEventListener('message', handler);
      window.postMessage({ type: 'NGA_GET_GLOBAL', key, reqId }, '*');
    });
  },

  /**
   * 调用页面级函数 (替代 unsafeWindow.func())
   */
  async callGlobalFunc<T>(func: string, ...args: unknown[]): Promise<T> {
    return new Promise((resolve, reject) => {
      const reqId = createRequestId();
      const handler = (event: MessageEvent<unknown>) => {
        const data = event.data;
        if (isRecord(data) && data.reqId === reqId) {
          window.removeEventListener('message', handler);
          if (data.type === 'NGA_CALL_RES') {
            resolve(data.result as T);
          } else if (data.type === 'NGA_CALL_ERR') {
            reject(data.error);
          }
        }
      };
      window.addEventListener('message', handler);
      window.postMessage({ type: 'NGA_CALL_GLOBAL', func, args, reqId }, '*');
    });
  },
};
