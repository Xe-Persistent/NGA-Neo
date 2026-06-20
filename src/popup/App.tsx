import { Suspense, use, useState } from "react";
import { normalSettings, advancedSettings } from "../config/settings";

interface BanListItem {
  uid: string;
  name: string;
  desc?: string;
}

interface UserMark {
  mark: string;
  text_color: string;
  bg_color: string;
  desc?: string;
}

interface MarkListItem {
  uid: string;
  name: string;
  marks: UserMark[];
}

interface SettingsData {
  normal: Record<string, unknown>;
  advanced: Record<string, unknown>;
  banList: BanListItem[];
  markList: MarkListItem[];
  keywordsList: string[];
  rawConfig: Record<string, unknown>;
}

const STORAGE_KEYS = [
  "hld__NGA_setting",
  "hld__NGA_advanced_setting",
  "hld__NGA_ban_list",
  "hld__NGA_mark_list",
  "hld__NGA_keywords_list"
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown): string => (typeof value === "string" ? value : "");

const parseJson = (value: unknown): unknown => {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

const createDefaults = (settings: typeof normalSettings): Record<string, unknown> => {
  const defaults: Record<string, unknown> = {};
  settings.forEach((setting) => {
    defaults[setting.key] = setting.default ?? "";
  });
  return defaults;
};

const parseSettingsRecord = (value: unknown, defaults: Record<string, unknown>) => {
  const parsed = parseJson(value);
  if (!isRecord(parsed)) return { ...defaults };

  const merged = { ...defaults };
  Object.entries(parsed).forEach(([key, item]) => {
    if (key in merged) {
      merged[key] = item;
    }
  });
  return merged;
};

const parseBanList = (value: unknown): BanListItem[] => {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter(isRecord)
    .map((item) => ({
      uid: readString(item.uid),
      name: readString(item.name),
      desc: readString(item.desc) || undefined
    }))
    .filter((item) => item.uid || item.name);
};

const parseMarkList = (value: unknown): MarkListItem[] => {
  const parsed = parseJson(value);
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
};

const parseKeywordsList = (value: unknown): string[] => {
  const parsed = parseJson(value);
  if (Array.isArray(parsed)) {
    return parsed.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

// 读取本地存储
function fetchSettings() {
  return new Promise<SettingsData>((resolve) => {
    chrome.storage.local.get([...STORAGE_KEYS], (res) => {
      const storage = res as Record<string, unknown>;
      const normal = parseSettingsRecord(
        storage["hld__NGA_setting"],
        createDefaults(normalSettings)
      );
      const advanced = parseSettingsRecord(
        storage["hld__NGA_advanced_setting"],
        createDefaults(advancedSettings)
      );
      const rawConfig: Record<string, unknown> = {};
      STORAGE_KEYS.forEach((key) => {
        if (key in storage) rawConfig[key] = storage[key];
      });

      resolve({
        normal,
        advanced,
        banList: parseBanList(storage["hld__NGA_ban_list"]),
        markList: parseMarkList(storage["hld__NGA_mark_list"]),
        keywordsList: parseKeywordsList(storage["hld__NGA_keywords_list"]),
        rawConfig
      });
    });
  });
}

// 在模块外部发起 Promise
const settingsPromise = fetchSettings();

function SettingsForm({
  settingsData
}: {
  settingsData: SettingsData;
}) {
  const [activeTab, setActiveTab] = useState<"normal" | "advanced" | "list" | "backup">("normal");

  const [banList, setBanList] = useState(settingsData.banList);
  const [markList, setMarkList] = useState(settingsData.markList);

  const removeBan = (uid: string) => {
    const newList = banList.filter((b) => b.uid !== uid);
    setBanList(newList);
    chrome.storage.local.set({ hld__NGA_ban_list: JSON.stringify(newList) });
  };

  const removeMark = (uid: string) => {
    const newList = markList.filter((m) => m.uid !== uid);
    setMarkList(newList);
    chrome.storage.local.set({ hld__NGA_mark_list: JSON.stringify(newList) });
  };

  const [keywordsText, setKeywordsText] = useState(settingsData.keywordsList.join("\n"));
  const saveKeywords = () => {
    const list = keywordsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const uniqueList = Array.from(new Set(list));
    chrome.storage.local.set({ hld__NGA_keywords_list: JSON.stringify(uniqueList) });
    alert("关键字保存成功，刷新 NGA 页面生效");
  };

  const [importConfig, setImportConfig] = useState("");
  const handleImport = () => {
    try {
      const parsed = JSON.parse(importConfig) as unknown;
      if (!isRecord(parsed)) {
        alert("导入失败：JSON格式不正确");
        return;
      }
      chrome.storage.local.set(parsed, () => {
        alert("配置导入成功，刷新 NGA 页面生效");
      });
    } catch {
      alert("导入失败：JSON格式不正确");
    }
  };

  // 本地更新配置
  const [optimisticNormal, setOptimisticNormal] = useState<Record<string, unknown>>(
    settingsData.normal
  );

  const [optimisticAdv, setOptimisticAdv] = useState<Record<string, unknown>>(
    settingsData.advanced
  );

  const handleNormalChange = (key: string, value: unknown) => {
    const newSettings = { ...optimisticNormal, [key]: value };
    setOptimisticNormal(newSettings);
    // 保存到 chrome.storage
    chrome.storage.local.set({ hld__NGA_setting: JSON.stringify(newSettings) });
  };

  const handleAdvChange = (key: string, value: unknown) => {
    const newSettings = { ...optimisticAdv, [key]: value };
    setOptimisticAdv(newSettings);
    // 保存到 chrome.storage
    chrome.storage.local.set({ hld__NGA_advanced_setting: JSON.stringify(newSettings) });
  };

  return (
    <div>
      <div style={{ display: "flex", borderBottom: "1px solid #e0c19e", marginBottom: "15px" }}>
        <button
          style={{
            flex: 1,
            padding: "8px",
            cursor: "pointer",
            background: activeTab === "normal" ? "#591804" : "#fff8e7",
            color: activeTab === "normal" ? "#fff0cd" : "#591804",
            border: "1px solid #591804"
          }}
          onClick={() => setActiveTab("normal")}
        >
          基础设置
        </button>
        <button
          style={{
            flex: 1,
            padding: "8px",
            cursor: "pointer",
            background: activeTab === "advanced" ? "#591804" : "#fff8e7",
            color: activeTab === "advanced" ? "#fff0cd" : "#591804",
            border: "1px solid #591804",
            borderLeft: "none"
          }}
          onClick={() => setActiveTab("advanced")}
        >
          高级设置
        </button>
        <button
          style={{
            flex: 1,
            padding: "8px",
            cursor: "pointer",
            background: activeTab === "list" ? "#591804" : "#fff8e7",
            color: activeTab === "list" ? "#fff0cd" : "#591804",
            border: "1px solid #591804",
            borderLeft: "none"
          }}
          onClick={() => setActiveTab("list")}
        >
          名单管理
        </button>
        <button
          style={{
            flex: 1,
            padding: "8px",
            cursor: "pointer",
            background: activeTab === "backup" ? "#591804" : "#fff8e7",
            color: activeTab === "backup" ? "#fff0cd" : "#591804",
            border: "1px solid #591804",
            borderLeft: "none"
          }}
          onClick={() => setActiveTab("backup")}
        >
          备份/导入
        </button>
      </div>

      <div style={{ maxHeight: "400px", overflowY: "auto", overflowX: "hidden" }}>
        {activeTab === "normal" && (
          <div>
            {normalSettings.map((setting) => {
              const val = optimisticNormal[setting.key] ?? setting.default;
              return (
                <div key={setting.key} style={{ marginBottom: "10px" }}>
                  <label
                    style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                    title={setting.desc}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(val)}
                      onChange={(e) => handleNormalChange(setting.key, e.target.checked)}
                      style={{ marginRight: "8px" }}
                    />
                    {setting.title || setting.key}
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "advanced" && (
          <div>
            {advancedSettings.map((setting) => {
              const val = optimisticAdv[setting.key] ?? setting.default;
              const type = typeof setting.default;
              return (
                <div
                  key={setting.key}
                  style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}
                  title={setting.desc}
                >
                  <span>{setting.title || setting.key}</span>
                  {setting.options ? (
                    <select
                      value={String(val)}
                      onChange={(e) => handleAdvChange(setting.key, e.target.value)}
                      style={{ padding: "2px", width: "100px" }}
                    >
                      {setting.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : type === "boolean" ? (
                    <input
                      type="checkbox"
                      checked={Boolean(val)}
                      onChange={(e) => handleAdvChange(setting.key, e.target.checked)}
                    />
                  ) : type === "number" ? (
                    <input
                      type="number"
                      value={Number(val)}
                      onChange={(e) => handleAdvChange(setting.key, Number(e.target.value))}
                      style={{ width: "60px" }}
                    />
                  ) : type === "string" ? (
                    <input
                      type={setting.key.toLowerCase().includes("color") ? "color" : "text"}
                      value={String(val)}
                      onChange={(e) => handleAdvChange(setting.key, e.target.value)}
                      style={
                        setting.key.toLowerCase().includes("color")
                          ? {
                              padding: 0,
                              width: "30px",
                              height: "24px",
                              cursor: "pointer",
                              border: "none"
                            }
                          : { width: "100px", padding: "2px 4px" }
                      }
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "list" && (
          <div>
            <h4 style={{ margin: "0 0 10px 0" }}>黑名单</h4>
            {banList.length === 0 && (
              <div style={{ color: "#999", fontSize: "12px" }}>暂无黑名单</div>
            )}
            <ul style={{ padding: 0, margin: "0 0 20px 0", listStyle: "none" }}>
              {banList.map((b) => (
                <li
                  key={b.uid}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                    padding: "5px",
                    background: "#f9f9f9",
                    borderRadius: "4px"
                  }}
                >
                  <span>
                    {b.name} <span style={{ color: "#888", fontSize: "12px" }}>(UID:{b.uid})</span>
                  </span>
                  <button
                    onClick={() => removeBan(b.uid)}
                    style={{ cursor: "pointer", color: "red", border: "none", background: "none" }}
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>

            <h4 style={{ margin: "0 0 10px 0" }}>标记名单</h4>
            {markList.length === 0 && (
              <div style={{ color: "#999", fontSize: "12px" }}>暂无标记</div>
            )}
            <ul style={{ padding: 0, margin: "0 0 20px 0", listStyle: "none" }}>
              {markList.map((m) => (
                <li
                  key={m.uid}
                  style={{
                    marginBottom: "10px",
                    padding: "5px",
                    background: "#f9f9f9",
                    borderRadius: "4px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px"
                    }}
                  >
                    <span>
                      {m.name}{" "}
                      <span style={{ color: "#888", fontSize: "12px" }}>(UID:{m.uid})</span>
                    </span>
                    <button
                      onClick={() => removeMark(m.uid)}
                      style={{
                        cursor: "pointer",
                        color: "red",
                        border: "none",
                        background: "none"
                      }}
                    >
                      删除
                    </button>
                  </div>
                  <div>
                    {m.marks.map((mark) => (
                      <span
                        key={`${m.uid}-${m.name}-${mark.mark}-${mark.text_color}-${mark.bg_color}`}
                        style={{
                          background: mark.bg_color,
                          color: mark.text_color,
                          padding: "2px 4px",
                          marginRight: "5px",
                          borderRadius: "3px",
                          fontSize: "12px"
                        }}
                      >
                        {mark.mark}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            <h4 style={{ margin: "0 0 10px 0" }}>屏蔽关键字</h4>
            <textarea
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              rows={5}
              placeholder="一行一条，以/开头会被识别为正则表达式"
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginBottom: "5px",
                padding: "5px"
              }}
            />
            <button
              onClick={saveKeywords}
              style={{ marginBottom: "20px", cursor: "pointer", padding: "4px 8px" }}
            >
              保存关键字
            </button>
          </div>
        )}

        {activeTab === "backup" && (
          <div>
            <h4 style={{ margin: "0 0 10px 0" }}>导出当前配置</h4>
            <textarea
              readOnly
              value={JSON.stringify(settingsData.rawConfig)}
              rows={6}
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginBottom: "20px",
                padding: "5px"
              }}
            />
            <h4 style={{ margin: "0 0 10px 0" }}>导入配置</h4>
            <textarea
              value={importConfig}
              onChange={(e) => setImportConfig(e.target.value)}
              rows={6}
              placeholder="粘贴您备份的配置 JSON"
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginBottom: "5px",
                padding: "5px"
              }}
            />
            <button onClick={handleImport} style={{ cursor: "pointer", padding: "4px 8px" }}>
              确认导入
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AppContent() {
  const settingsData = use(settingsPromise);
  return <SettingsForm settingsData={settingsData} />;
}

export function App() {
  return (
    <div style={{ padding: "15px" }}>
      <h2 style={{ textAlign: "center", color: "#591804" }}>NGA优化摸鱼体验</h2>
      <Suspense fallback={<div style={{ textAlign: "center", padding: "20px" }}>加载中...</div>}>
        <AppContent />
      </Suspense>
    </div>
  );
}
