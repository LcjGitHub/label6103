# 信封地址排版预览器

React + Tailwind 搭建的信封地址排版预览工具。首页填写寄件人/收件人 Mock 表单，第二页实时预览中式/英式信封 CSS 布局，支持 3 种信封尺寸切换与 PNG 导出。

## 功能

- **首页表单**：寄件人、收件人地址字段，一键载入中式/英式 Mock 数据
- **预览页**：中式（邮编框 + 右侧收件人）/ 英式（居中收件人 + Return Address）布局切换
- **3 种尺寸**：5号 110×220、6号 120×230、7号 160×230（mm）
- **正反面**：正面收件人 / 背面寄件人
- **导出 PNG**：html2canvas 高清导出
- **本地存储**：localStorage 持久化，无后端

## 启动

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:8101`。

## 构建

```bash
npm run build
npm run preview
```

## 技术栈

- Vite + React 18 + TypeScript
- Tailwind CSS 3
- React Router 6
- html2canvas
