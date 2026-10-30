import { isRecord, parseJson } from '@/lib/guards';
import { STORAGE_KEYS } from '@/lib/storageKeys';

interface AboutTabProps {
  rawConfig: Record<string, unknown>;
}

export function AboutTab({ rawConfig }: AboutTabProps) {
  const getVersion = (): string => {
    if (import.meta.env.DEV) {
      return 'dev';
    }
    return chrome.runtime.getManifest().version;
  };

  const getLogoUrl = (): string => {
    try {
      return chrome.runtime.getURL('icons/icon48.png');
    } catch {
      return '/public/icons/icon48.png';
    }
  };

  const handleExport = () => {
    try {
      const blob = new Blob([JSON.stringify(rawConfig, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateString = new Date().toISOString().slice(0, 10);
      a.download = `nga-neo-config-${dateString}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('导出配置文件失败');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const parsed = parseJson(text);
          if (!isRecord(parsed)) {
            alert('导入失败：JSON 格式不正确');
            return;
          }
          const allowedKeys = STORAGE_KEYS as readonly string[];
          const accepted: Record<string, unknown> = {};
          Object.entries(parsed).forEach(([key, value]) => {
            if (allowedKeys.includes(key)) accepted[key] = value;
          });
          if (Object.keys(accepted).length === 0) {
            alert('导入失败：未找到可识别的配置项');
            return;
          }
          chrome.storage.local.set(accepted, () => {
            alert('配置导入成功，刷新 NGA 页面生效');
          });
        } catch {
          alert('导入失败：JSON 格式不正确');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="nga-about-container">
      {/* 插件头部信息 */}
      <div className="nga-about-header">
        <div className="nga-about-logo">
          <img
            src={getLogoUrl()}
            alt="Logo"
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
        </div>
        <div className="nga-about-meta">
          <h3 className="nga-about-name">NGA-Neo</h3>
          <span className="nga-about-version">版本: v{getVersion()}</span>
        </div>
      </div>

      <p className="nga-about-desc">
        本插件旨在优化 NGA
        论坛的日常浏览和摸鱼体验，提供更加清爽、高效的排版，支持屏蔽指定用户、关键词、高亮特定标记等进阶配置。
      </p>

      {/* 项目链接与 GitHub */}
      <div className="nga-about-links">
        <a
          href="https://github.com/Xe-Persistent/NGA-Neo"
          target="_blank"
          rel="noopener noreferrer"
          className="nga-about-link-item"
        >
          <svg
            className="github-icon"
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="currentColor"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          GitHub
        </a>
      </div>

      {/* 配置备份与还原 */}
      <div className="nga-about-section">
        <h4 className="nga-about-section-title">配置备份与还原</h4>
        <p className="nga-about-section-desc">
          您可导出当前的所有配置并保存为 JSON 文件，或导入已有的备份文件来还原设置。
        </p>
        <div className="nga-about-actions">
          <button className="nga-popup-action-btn" onClick={handleExport}>
            导出配置
          </button>
          <button className="nga-popup-action-btn" onClick={handleImport}>
            导入配置
          </button>
        </div>
      </div>
    </div>
  );
}
