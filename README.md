<div align="center">
  <img src="public/icons/icon128.png" alt="NGA-Neo Logo" width="128" height="128" style="border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />
  <h1>NGA-Neo</h1>
  <p>一款现代化的 NGA 玩家社区论坛体验增强浏览器扩展</p>

  <p>
    <a href="https://github.com/Xe-Persistent/NGA-Neo/stargazers"><img src="https://img.shields.io/github/stars/Xe-Persistent/NGA-Neo?logo=github" alt="Stars" /></a>
    <a href="https://github.com/Xe-Persistent/NGA-Neo/issues"><img src="https://img.shields.io/github/issues/Xe-Persistent/NGA-Neo?logo=github" alt="Issues" /></a>
    <a href="https://github.com/Xe-Persistent/NGA-Neo/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Xe-Persistent/NGA-Neo" alt="License" /></a>
    <a href="https://github.com/Xe-Persistent/NGA-Neo/actions/workflows/ci.yml"><img src="https://github.com/Xe-Persistent/NGA-Neo/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
    <br>
    <img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Vite-9135FF?logo=vite&logoColor=white" alt="Vite">
  </p>
</div>

---

**NGA-Neo** 是一款针对 NGA 玩家社区（nga.cn）开发的高性能、高定制化浏览器扩展程序。它承袭自备受欢迎的油猴脚本 _[NGA优化摸鱼体验](https://greasyfork.org/zh-CN/scripts/393991-nga%E4%BC%98%E5%8C%96%E6%91%B8%E9%B1%BC%E4%BD%93%E9%AA%8C)_，并在全新架构下使用 **React** 和 **TypeScript** 进行了彻头彻尾的重构。

通过将功能迁移到 Manifest V3 标准的 Chrome 扩展，我们为用户带来了：

- ⚡ **极致性能**：模块化架构按需注入，大幅降低 NGA 页面渲染延迟。
- ⚙️ **独立设置面板**：采用现代化的 React Popup 面板，与 NGA 页面逻辑解耦，配置更直观、操作更流畅。
- 🔒 **安全与隔离**：严格遵循 Manifest V3 安全标准，通过 `MAIN` world 隔离注入技术，避免与页面其他脚本冲突。
- 🧩 **无缝热更新开发**：利用 Vite + CRX，支持开发过程中的热模块替换（HMR）。

---

## ✨ 核心功能列表

NGA-Neo 提供了一系列可配置的功能模块，旨在为您提供最优雅的“水贴”与“摸鱼”体验。

### 📊 摸鱼神器

- **Excel 模式**：将 NGA 论坛秒变电子表格！支持**腾讯文档风格**（矢量绘制，高分屏首选）、**WPS 风格**与 **Office 风格**。完美伪装，轻松避开老板的视线。

### 🎨 视觉优化与定制

- **界面净化**：隐藏头像、表情包、楼内图片、版头、版规、子版块或签名档，将贴子内容纯文本化，降低阅读时的干扰。

### 🛡️ 社交与屏蔽系统

- **拉黑名单与备注**：在回复的用户信息处，直接对其进行拉黑或添加备注标签；也可在扩展面板的「名单管理」中手动新增、编辑用户与标签。支持导出/导入配置文件进行备份。
- **自定义拉黑模式**：
  - _屏蔽_：保留楼层，仅折叠屏蔽内容，支持手动点击展开。
  - _删除_：直接彻底移除对应楼层。
  - _级联删除_：不仅删除被拉黑用户，连同回复该用户的楼层也一并删除。
- **关键字和正则屏蔽**：支持自定义关键字或**正则表达式**。一旦标题、回复或贴条匹配关键字，自动做屏蔽处理。

### 🔍 用户画像增强

- **用户增强信息**：用户信息栏直观显示**吧龄**、**发帖数**和 **IP 属地**。

### 🖼️ 图片与交互优化

- **图片缩放与限宽**：自动将贴内大图限制在指定宽度（默认 200px），多图排版不混乱。
- **独立图片浏览界面**：点击图片进入大图浏览：
  - **手势操作**：支持左键拖拽平移、旋转。支持鼠标滚轮无限缩放。
  - **图片轮播**：支持在大图浏览界面中快速切换当前楼层内的其他图片。
- **链接直接跳转**：跳过 NGA 默认的安全警示页面，点击链接直接直达目标网页。
- **自动翻页**：滚动到页面底部时，自动加载并拼接下一页内容，看长帖更连贯。
- **折叠引用**：自动折叠超过指定高度（默认 300px）的引用（Quote）内容，点击可展开。

---

## 🌐 支持的域名与浏览器

本插件会自动应用到以下 NGA 相关域名：

- `*://bbs.nga.cn/*`
- `*://ngabbs.com/*`
- `*://nga.178.com/*`
- `*://g.nga.cn/*`

_(如在其他子域名或分流域名下遇到插件功能没有生效的情况，欢迎提交 Issue)_

浏览器要求：Chrome / Edge 等 Chromium 内核浏览器 **111 及以上**（依赖 Manifest V3 的 `world: "MAIN"` 注入能力）。

---

## ⚠️ 已知限制

- **修改设置后需刷新 NGA 页面**：扩展面板写入的是本地存储，已打开的页面不会热重载配置，请在修改后刷新页面。
- **不受支持的功能**：旧版油猴脚本中的暗黑/护眼模式、字号调整、悬浮工具栏、全局快捷键、评分面板、WebDAV 同步、用户活动统计与插件系统**已废弃，不再计划支持**。
- **图片/表情识别**：通过外链插入的图片不会被识别为原生表情，隐藏表情功能对其无效，可改用「隐藏贴内图片」。

---

## 🛠️ 项目技术架构

项目基于 Chrome 扩展 Manifest V3 规范设计，模块划分清晰，易于维护与扩展：

```text
NGA-Neo/
├── manifest.json         # 扩展元数据 (Manifest V3)
├── vite.config.ts        # Vite 8 构建配置 (使用 @crxjs/vite-plugin)
├── src/
│   ├── popup/            # React 19 开发的独立设置面板 (显示在浏览器右上角)
│   │   ├── components/   # 常规设置、名单管理、关于等 Tab 页
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── content/          # Content Scripts (运行在沙盒环境中，操纵 DOM)
│   │   ├── core/         # 插件核心 App 驱动
│   │   ├── modules/      # 各项增强功能的模块化实现 (Style, ExcelMode, UserEnhance 等)
│   │   └── index.ts      # Content Scripts 入口，负责注册各模块并运行
│   ├── injected/         # Inject Scripts (以 MAIN world 注入到页面主环境)
│   │   └── main.ts       # 负责拦截底层原生 JS 或共享 NGA 全局数据
│   ├── config/           # 统一配置管理器，对接 chrome.storage 存储
│   └── styles/           # 全局样式及 SCSS 变量定义
```

---

## 🚀 开发者指南

如果您希望在本地运行、修改或参与贡献，请参考以下指引：

### 前提条件

安装 [Node.js](https://nodejs.org/) (推荐 v24 或更高版本)。

### 1. 克隆项目

```bash
git clone https://github.com/Xe-Persistent/NGA-Neo.git
cd NGA-Neo
```

### 2. 安装依赖

```bash
npm install
```

### 3. 本地开发与实时编译

运行以下命令启动 Vite 开发服务器。`@crxjs/vite-plugin` 将会自动在项目根目录构建 `dist` 目录，并支持代码修改后的**实时热重载（HMR）**：

```bash
npm run dev
```

### 4. 生产环境打包

构建用于分发的打包文件，产物输出至 `dist` 目录：

```bash
npm run build
```

### 5. 代码检查与测试

```bash
npm run lint          # ESLint
npm run format:check  # Prettier 格式检查（npm run format 可自动修复）
npm run test          # Vitest 单元测试
```

### 6. 在浏览器中加载扩展程序

1. 打开 Google Chrome 或其他 Chromium 内核浏览器（如 Microsoft Edge等）。
2. 在地址栏输入并访问 `chrome://extensions/`。
3. 在页面右上角，开启 **开发者模式 (Developer mode)** 开关。
4. 点击左上角的 **加载未打包的扩展程序 (Load unpacked)** 按钮。
5. 在弹出的文件选择器中，选中 `NGA-Neo` 项目根目录下的 `dist` 文件夹。
6. 加载成功后，您会在扩展列表中看到 **NGA-Neo**。

### 7. 发布版本

版本号以 `package.json` 的 `version` 为唯一来源，构建时会自动写入 `manifest.json`：

```bash
npm version 1.0.1 --no-git-tag-version
git commit -am "chore: release v1.0.1"
git tag v1.0.1
git push origin master --tags
```

推送 `v*` 标签后，GitHub Actions 会自动执行测试与构建、校验 manifest 版本与标签一致、打包 `nga-neo-vX.Y.Z.zip` 并创建 Release。

---

## ❓ FAQ

#### Q：新版插件的设置面板在哪里？

**A**：旧版油猴脚本的设置入口集成在 NGA 页面的个人中心；新版 **NGA-Neo** 是一个独立的浏览器扩展程序。点击浏览器右上角的扩展图标，找到 **NGA-Neo** 并固定到工具栏。点击其图标即可弹出设置面板。

#### Q：部分表情或图片无法隐藏？

**A**：有些表情是发帖者直接通过外链图床插入的图片，而非编辑器的原生表情，此时隐藏表情模块可能无法将其完全识别。如遇此类情况，可以在设置中启用“隐藏楼内图片”模块来过滤图片。

#### Q：开启自动翻页后，点击底部的回复面板不方便？

**A**：自动翻页会自动拼接下一页，会导致页面变长而难以触及网页最底部的原生输入框。推荐使用页面右上角或 Excel 面板顶部提供的回复/收藏按钮进行快捷操作。

---

## 🤝 参与贡献与反馈

欢迎任何形式的贡献！无论是报告 Bug、提出 Feature 建议，还是提交 Pull Request，我们都非常感激。

- **报告问题**：若遇到 Bug 或有改进意见，请在 GitHub 上提交 [Issues](https://github.com/Xe-Persistent/NGA-Neo/issues)。
- **Bug 反馈规范**：反馈 Bug 时请务必带上 **浏览器名称与版本**，并配上相关的图文或控制台报错日志截图，这将极大地帮助我们定位和解决问题。

---

## ❤️ 鸣谢

- 感谢 [NGA优化摸鱼体验](https://greasyfork.org/zh-CN/scripts/393991-nga%E4%BC%98%E5%8C%96%E6%91%B8%E9%B1%BC%E4%BD%93%E9%AA%8C) 提供的灵感与功能基础。

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 协议开源。
