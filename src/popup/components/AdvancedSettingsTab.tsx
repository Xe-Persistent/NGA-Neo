import type { AdvancedSettings } from '@/config/settings.ts';
import { advancedSettings } from '@/config/settings.ts';

interface AdvancedSettingsTabProps {
  settings: AdvancedSettings;
  onChange: (key: string, value: unknown) => void;
}

export function AdvancedSettingsTab({ settings, onChange }: AdvancedSettingsTabProps) {
  return (
    <div className="nga-popup-advanced-settings">
      {advancedSettings.map((setting) => {
        const val =
          (settings as unknown as Record<string, unknown>)[setting.key] ?? setting.default;
        const type = typeof setting.default;
        return (
          <div key={setting.key} className="nga-popup-adv-item" title={setting.desc}>
            <span>{setting.title || setting.key}</span>
            {setting.options ? (
              <select value={String(val)} onChange={(e) => onChange(setting.key, e.target.value)}>
                {setting.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : type === 'boolean' ? (
              <input
                type="checkbox"
                checked={Boolean(val)}
                onChange={(e) => onChange(setting.key, e.target.checked)}
              />
            ) : type === 'number' ? (
              <input
                type="number"
                value={Number(val)}
                onChange={(e) => onChange(setting.key, Number(e.target.value))}
              />
            ) : type === 'string' ? (
              <input
                type={setting.key.toLowerCase().includes('color') ? 'color' : 'text'}
                value={String(val)}
                onChange={(e) => onChange(setting.key, e.target.value)}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
