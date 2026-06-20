const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readGlobalPath = (path: string): unknown => {
  let current: unknown = window;
  for (const part of path.split(".")) {
    if (!part) return null;
    if ((typeof current !== "object" && typeof current !== "function") || current === null) {
      return null;
    }
    current = Reflect.get(current, part);
  }
  return current;
};

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  const data = event.data;
  if (!isRecord(data)) return;

  if (data.type === "NGA_GET_GLOBAL" && typeof data.key === "string") {
    const reqId = typeof data.reqId === "string" ? data.reqId : "";
    try {
      window.postMessage(
        {
          type: "NGA_GLOBAL_RES",
          key: data.key,
          reqId,
          value: readGlobalPath(data.key)
        },
        "*"
      );
    } catch {
      window.postMessage(
        {
          type: "NGA_GLOBAL_RES",
          key: data.key,
          reqId,
          value: null
        },
        "*"
      );
    }
  }

  if (data.type === "NGA_CALL_GLOBAL" && typeof data.func === "string") {
    const reqId = typeof data.reqId === "string" ? data.reqId : "";
    try {
      const f = readGlobalPath(data.func);
      if (typeof f === "function") {
        const args = Array.isArray(data.args) ? data.args : [];
        const result = f(...args);
        window.postMessage({ type: "NGA_CALL_RES", reqId, result }, "*");
      } else {
        window.postMessage({ type: "NGA_CALL_ERR", reqId, error: "Function not found" }, "*");
      }
    } catch (e) {
      window.postMessage({ type: "NGA_CALL_ERR", reqId, error: String(e) }, "*");
    }
  }
});
