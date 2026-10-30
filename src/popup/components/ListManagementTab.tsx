import { useEffect, useState } from 'react';
import type { BanUser, MarkUser, UserMark } from '@/lib/types';

interface ListManagementTabProps {
  banList: BanUser[];
  markList: MarkUser[];
  keywordsList: string[];
  onChangeBanList: (list: BanUser[]) => void;
  onChangeMarkList: (list: MarkUser[]) => void;
  onChangeKeywordsList: (list: string[]) => void;
}

interface EditorState {
  kind: 'ban' | 'mark';
  /** 正在编辑的条目下标，null 表示新增 */
  index: number | null;
  name: string;
  uid: string;
  desc: string;
  marks: UserMark[];
}

const matchesUser = (item: { uid: string; name: string }, target: { uid: string; name: string }) =>
  Boolean(item.uid && target.uid && item.uid === target.uid) ||
  Boolean(item.name && target.name && item.name === target.name);

const createMark = (): UserMark => ({
  mark: '',
  text_color: '#ffffff',
  bg_color: '#1f72f1',
});

export function ListManagementTab({
  banList,
  markList,
  keywordsList,
  onChangeBanList,
  onChangeMarkList,
  onChangeKeywordsList,
}: ListManagementTabProps) {
  const [keywordsText, setKeywordsText] = useState(keywordsList.join('\n'));
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const notify = (text: string) => {
    setNotice(text);
  };

  useEffect(() => {
    if (!editor) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setEditor(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [editor]);

  const saveKeywords = () => {
    const list = keywordsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const uniqueList = Array.from(new Set(list));
    onChangeKeywordsList(uniqueList);
    notify('关键字已保存，刷新 NGA 页面生效');
  };

  const openEditor = (kind: 'ban' | 'mark', index: number | null) => {
    if (kind === 'ban') {
      const item = index === null ? null : banList[index];
      setEditor({
        kind,
        index,
        name: item?.name ?? '',
        uid: item?.uid ?? '',
        desc: item?.desc ?? '',
        marks: [],
      });
      return;
    }
    const item = index === null ? null : markList[index];
    setEditor({
      kind,
      index,
      name: item?.name ?? '',
      uid: item?.uid ?? '',
      desc: '',
      marks: item && item.marks.length > 0 ? item.marks.map((m) => ({ ...m })) : [createMark()],
    });
  };

  const updateEditor = (patch: Partial<EditorState>) => {
    setEditor((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const updateMark = (index: number, patch: Partial<UserMark>) => {
    setEditor((prev) => {
      if (!prev) return prev;
      const marks = prev.marks.map((mark, i) => (i === index ? { ...mark, ...patch } : mark));
      return { ...prev, marks };
    });
  };

  const handleSave = () => {
    if (!editor) return;
    const name = editor.name.trim();
    const uid = editor.uid.trim();
    if (!name && !uid) {
      alert('UID 与用户名至少填写一项');
      return;
    }

    if (editor.kind === 'ban') {
      const entry: BanUser = { uid, name, desc: editor.desc.trim() || undefined };
      const next = [...banList];
      const duplicated = next.some((item, i) => i !== editor.index && matchesUser(item, entry));
      if (duplicated) {
        alert('名单中已存在相同 UID 或用户名的用户');
        return;
      }
      if (editor.index === null) next.push(entry);
      else next[editor.index] = entry;
      onChangeBanList(next);
      notify('名单已保存，刷新 NGA 页面生效');
    } else {
      const marks = editor.marks
        .map((mark) => ({
          mark: mark.mark.trim(),
          text_color: mark.text_color,
          bg_color: mark.bg_color,
          desc: mark.desc?.trim() || undefined,
        }))
        .filter((mark) => mark.mark);
      if (marks.length === 0) {
        alert('请至少填写一个标签');
        return;
      }
      const entry: MarkUser = { uid, name, marks };
      const next = [...markList];
      const duplicated = next.some((item, i) => i !== editor.index && matchesUser(item, entry));
      if (duplicated) {
        alert('名单中已存在相同 UID 或用户名的用户');
        return;
      }
      if (editor.index === null) next.push(entry);
      else next[editor.index] = entry;
      onChangeMarkList(next);
      notify('名单已保存，刷新 NGA 页面生效');
    }

    setEditor(null);
  };

  return (
    <>
      {notice && <div className="nga-popup-notice">{notice}</div>}
      <div className="nga-popup-list-header">
        <div className="nga-popup-list-title">黑名单</div>
        <button className="nga-popup-add-btn" onClick={() => openEditor('ban', null)}>
          + 添加用户
        </button>
      </div>
      {banList.length === 0 ? (
        <div className="nga-popup-empty-tip">暂无黑名单</div>
      ) : (
        <div className="nga-popup-list-container">
          {banList.map((b, index) => (
            <div key={`${b.uid}-${b.name}`} className="nga-popup-list-item-column">
              <div className="nga-item-header">
                <span className="nga-user-info">
                  {b.name || '未知用户'} <span className="nga-user-desc">(UID:{b.uid || '-'})</span>
                </span>
                <span className="nga-item-actions">
                  <button className="nga-popup-edit-btn" onClick={() => openEditor('ban', index)}>
                    编辑
                  </button>
                  <button
                    className="nga-popup-delete-btn"
                    onClick={() => {
                      onChangeBanList(banList.filter((_, i) => i !== index));
                      notify('已删除，刷新 NGA 页面生效');
                    }}
                  >
                    删除
                  </button>
                </span>
              </div>
              {b.desc ? <div className="nga-item-desc">备注: {b.desc}</div> : null}
            </div>
          ))}
        </div>
      )}

      <div className="nga-popup-list-header">
        <div className="nga-popup-list-title">标记名单</div>
        <button className="nga-popup-add-btn" onClick={() => openEditor('mark', null)}>
          + 添加用户
        </button>
      </div>
      {markList.length === 0 ? (
        <div className="nga-popup-empty-tip">暂无标记</div>
      ) : (
        <div className="nga-popup-list-container">
          {markList.map((m, index) => (
            <div key={`${m.uid}-${m.name}`} className="nga-popup-list-item-column">
              <div className="nga-item-header">
                <span className="nga-user-info">
                  {m.name || '未知用户'} <span className="nga-user-desc">(UID:{m.uid || '-'})</span>
                </span>
                <span className="nga-item-actions">
                  <button className="nga-popup-edit-btn" onClick={() => openEditor('mark', index)}>
                    编辑
                  </button>
                  <button
                    className="nga-popup-delete-btn"
                    onClick={() => {
                      onChangeMarkList(markList.filter((_, i) => i !== index));
                      notify('已删除，刷新 NGA 页面生效');
                    }}
                  >
                    删除
                  </button>
                </span>
              </div>
              <div className="nga-item-tags">
                {m.marks.map((mark) => (
                  <span
                    key={`${m.uid}-${m.name}-${mark.mark}-${mark.text_color}-${mark.bg_color}`}
                    className="nga-mark-tag"
                    title={mark.desc}
                    style={{
                      background: mark.bg_color,
                      color: mark.text_color,
                    }}
                  >
                    {mark.mark}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="nga-popup-textarea-container">
        <div className="nga-popup-list-title">屏蔽关键字</div>
        <textarea
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          rows={5}
          placeholder="一行一条，以/开头会被识别为正则表达式"
        />
        <button
          className="nga-popup-action-btn nga-margin-top-8 nga-margin-bottom-15"
          onClick={saveKeywords}
        >
          保存
        </button>
      </div>

      {editor && (
        <div className="nga-list-editor-overlay" onClick={() => setEditor(null)}>
          <div className="nga-list-editor-panel" onClick={(e) => e.stopPropagation()}>
            <div className="nga-list-editor-title">
              {editor.kind === 'ban'
                ? editor.index === null
                  ? '添加黑名单用户'
                  : '编辑黑名单用户'
                : editor.index === null
                  ? '添加标记用户'
                  : '编辑标记用户'}
            </div>

            <div className="nga-list-editor-field">
              <label>用户名</label>
              <input
                type="text"
                value={editor.name}
                onChange={(e) => updateEditor({ name: e.target.value })}
                placeholder="用户名"
              />
            </div>
            <div className="nga-list-editor-field">
              <label>UID</label>
              <input
                type="text"
                value={editor.uid}
                onChange={(e) => updateEditor({ uid: e.target.value })}
                placeholder="UID"
              />
            </div>
            <div className="nga-list-editor-hint">
              用户名与 UID 至少填写一项，UID 的匹配优先级更高
            </div>

            {editor.kind === 'ban' ? (
              <div className="nga-list-editor-field">
                <label>备注</label>
                <input
                  type="text"
                  value={editor.desc}
                  onChange={(e) => updateEditor({ desc: e.target.value })}
                  placeholder="可选备注"
                />
              </div>
            ) : (
              <div className="nga-list-editor-marks">
                <div className="nga-list-editor-field-label">标签</div>
                {editor.marks.map((mark, index) => (
                  // 行内输入框以位置为身份，用下标作 key 可避免输入时重挂载导致失焦
                  // eslint-disable-next-line @eslint-react/no-array-index-key
                  <div className="nga-list-editor-mark-row" key={`editor-mark-${index}`}>
                    <input
                      type="text"
                      className="nga-mark-name-input"
                      value={mark.mark}
                      onChange={(e) => updateMark(index, { mark: e.target.value })}
                      placeholder="标签名"
                    />
                    <input
                      type="color"
                      title="文字颜色"
                      value={mark.text_color}
                      onChange={(e) => updateMark(index, { text_color: e.target.value })}
                    />
                    <input
                      type="color"
                      title="背景颜色"
                      value={mark.bg_color}
                      onChange={(e) => updateMark(index, { bg_color: e.target.value })}
                    />
                    <input
                      type="text"
                      className="nga-mark-desc-input"
                      value={mark.desc ?? ''}
                      onChange={(e) => updateMark(index, { desc: e.target.value })}
                      placeholder="可选备注"
                    />
                    <button
                      className="nga-popup-delete-btn"
                      title="删除此标签"
                      onClick={() =>
                        setEditor((prev) =>
                          prev
                            ? { ...prev, marks: prev.marks.filter((_, i) => i !== index) }
                            : prev,
                        )
                      }
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  className="nga-popup-add-btn nga-margin-top-5"
                  onClick={() =>
                    setEditor((prev) =>
                      prev ? { ...prev, marks: [...prev.marks, createMark()] } : prev,
                    )
                  }
                >
                  + 添加标签
                </button>
              </div>
            )}

            <div className="nga-list-editor-actions">
              <button className="nga-popup-action-btn" onClick={() => setEditor(null)}>
                取消
              </button>
              <button className="nga-popup-action-btn" onClick={handleSave}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
