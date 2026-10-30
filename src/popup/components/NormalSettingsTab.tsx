import type { NormalSettings } from '@/config/settings.ts';
import { normalSettings } from '@/config/settings.ts';

interface NormalSettingsTabProps {
  settings: NormalSettings;
  onChange: (key: string, value: unknown) => void;
}

export function NormalSettingsTab({ settings, onChange }: NormalSettingsTabProps) {
  return (
    <div className="nga-popup-normal-settings">
      {normalSettings.map((setting) => {
        const val =
          (settings as unknown as Record<string, unknown>)[setting.key] ?? setting.default;
        return (
          <div key={setting.key} className="nga-popup-setting-item">
            <label title={setting.desc}>
              <input
                type="checkbox"
                checked={Boolean(val)}
                onChange={(e) => onChange(setting.key, e.target.checked)}
              />
              {setting.title || setting.key}
            </label>
          </div>
        );
      })}
    </div>
  );
}
