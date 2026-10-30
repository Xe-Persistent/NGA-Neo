import { Suspense, use, useState } from 'react';
import type { PluginSetting, NormalSettings, AdvancedSettings } from '../config/settings';
import { normalSettings, advancedSettings } from '../config/settings';
import { isRecord, parseJson } from '@/lib/guards';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import type { BanUser, MarkUser } from '@/lib/types';
import { parseBanList, parseMarkList, parseKeywordsList } from '@/lib/parsers';
import { NormalSettingsTab } from './components/NormalSettingsTab';
import { AdvancedSettingsTab } from './components/AdvancedSettingsTab';
import { ListManagementTab } from './components/ListManagementTab';
import { AboutTab } from './components/AboutTab';
import './App.scss';

interface SettingsData {
  normal: NormalSettings;
  advanced: AdvancedSettings;
  banList: BanUser[];
  markList: MarkUser[];
  keywordsList: string[];
}

const createDefaults = (settings: PluginSetting[]): Record<string, unknown> => {
  const defaults: Record<string, unknown> = {};
  settings.forEach((setting) => {
    defaults[setting.key] = setting.default ?? '';
  });
  return defaults;
};

const parseSettingsRecord = <T extends Record<string, unknown>>(value: unknown, defaults: T): T => {
  const parsed = parseJson(value);
  if (!isRecord(parsed)) return { ...defaults };

  const merged = { ...defaults } as Record<string, unknown>;
  Object.entries(parsed).forEach(([key, item]) => {
    if (key in merged) {
      merged[key] = item;
    }
  });
  return merged as unknown as T;
};

// 读取本地存储
function fetchSettings() {
  return new Promise<SettingsData>((resolve) => {
    chrome.storage.local.get([...STORAGE_KEYS], (res) => {
      const storage = res as Record<string, unknown>;
      const normal = parseSettingsRecord(
        storage['nga-setting'],
        createDefaults(normalSettings),
      ) as unknown as NormalSettings;
      const advanced = parseSettingsRecord(
        storage['nga-advanced-setting'],
        createDefaults(advancedSettings),
      ) as unknown as AdvancedSettings;
      const banList = parseBanList(storage['nga-ban-list']);
      const markList = parseMarkList(storage['nga-mark-list']);
      const keywordsList = parseKeywordsList(storage['nga-keywords-list']);

      resolve({
        normal,
        advanced,
        banList,
        markList,
        keywordsList,
      });
    });
  });
}

// 在模块外部发起 Promise
const settingsPromise = fetchSettings();

function SettingsForm({ settingsData }: { settingsData: SettingsData }) {
  const [activeTab, setActiveTab] = useState<'normal' | 'advanced' | 'list' | 'about'>('normal');

  const [banList, setBanList] = useState(settingsData.banList);
  const [markList, setMarkList] = useState(settingsData.markList);
  const [keywordsList, setKeywordsList] = useState(settingsData.keywordsList);

  const saveBanList = (list: BanUser[]) => {
    setBanList(list);
    chrome.storage.local.set({ 'nga-ban-list': JSON.stringify(list) });
  };

  const saveMarkList = (list: MarkUser[]) => {
    setMarkList(list);
    chrome.storage.local.set({ 'nga-mark-list': JSON.stringify(list) });
  };

  const saveKeywordsList = (list: string[]) => {
    setKeywordsList(list);
    chrome.storage.local.set({ 'nga-keywords-list': JSON.stringify(list) });
  };

  const [optimisticNormal, setOptimisticNormal] = useState<NormalSettings>(settingsData.normal);
  const [optimisticAdv, setOptimisticAdv] = useState<AdvancedSettings>(settingsData.advanced);

  const handleNormalChange = (key: string, value: unknown) => {
    const newSettings = { ...optimisticNormal, [key]: value };
    setOptimisticNormal(newSettings);
    chrome.storage.local.set({ 'nga-setting': JSON.stringify(newSettings) });
  };

  const handleAdvChange = (key: string, value: unknown) => {
    const newSettings = { ...optimisticAdv, [key]: value };
    setOptimisticAdv(newSettings);
    chrome.storage.local.set({ 'nga-advanced-setting': JSON.stringify(newSettings) });
  };

  // 导出内容基于当前界面状态，未修改过的项也会带上默认值
  const exportConfig: Record<string, unknown> = {
    'nga-setting': JSON.stringify(optimisticNormal),
    'nga-advanced-setting': JSON.stringify(optimisticAdv),
    'nga-ban-list': JSON.stringify(banList),
    'nga-mark-list': JSON.stringify(markList),
    'nga-keywords-list': JSON.stringify(keywordsList),
  };

  return (
    <>
      <div className="nga-popup-tabs">
        {(['normal', 'advanced', 'list', 'about'] as const).map((tab) => (
          <button
            key={tab}
            className={`nga-popup-tab-btn ${activeTab === tab ? 'nga-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {{ normal: '基础设置', advanced: '高级设置', list: '名单管理', about: '关于' }[tab]}
          </button>
        ))}
      </div>

      <div className="nga-popup-content-scroll">
        {activeTab === 'normal' && (
          <NormalSettingsTab settings={optimisticNormal} onChange={handleNormalChange} />
        )}
        {activeTab === 'advanced' && (
          <AdvancedSettingsTab settings={optimisticAdv} onChange={handleAdvChange} />
        )}
        {activeTab === 'list' && (
          <ListManagementTab
            banList={banList}
            markList={markList}
            keywordsList={keywordsList}
            onChangeBanList={saveBanList}
            onChangeMarkList={saveMarkList}
            onChangeKeywordsList={saveKeywordsList}
          />
        )}
        {activeTab === 'about' && <AboutTab rawConfig={exportConfig} />}
      </div>
    </>
  );
}

function AppContent() {
  const settingsData = use(settingsPromise);
  return <SettingsForm settingsData={settingsData} />;
}

export function App() {
  return (
    <div className="nga-popup-container">
      <Suspense fallback={<div className="nga-popup-empty-tip">加载中...</div>}>
        <AppContent />
      </Suspense>
    </div>
  );
}
