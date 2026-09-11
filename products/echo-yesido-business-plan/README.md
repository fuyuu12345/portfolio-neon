# ECHO Share（对外独立版）

独立于作品集霓虹主站的对外分享包。**不链回作品集。**

## 对外链接（GitHub Pages）

- 入口（选电脑 / 手机）：`https://fuyuu12345.github.io/portfolio-neon/products/echo-share/`
- 电脑版：`https://fuyuu12345.github.io/portfolio-neon/products/echo-share/web/`
- 手机版：`https://fuyuu12345.github.io/portfolio-neon/products/echo-share/mobile/`

## 与作品集内案例的关系

| 目录 | 用途 |
|------|------|
| `products/echo-yesido/` | 作品集内案例（可回作品集） |
| `products/echo-share/` | **本目录**：对外单独发送；后续可改成商业计划书 |

## 后续商业计划书改造建议

在本目录迭代即可，建议保留：

1. `index.html` — 版本选择（电脑 / 手机）
2. `web/` — 宽屏叙事 → 可演进为 BP 桌面阅读版
3. `mobile/` — 竖屏阅读 → 可演进为 BP 手机版
4. `assets/` — 产品 / UI / 团队图

可新增章节方向（不必一次做完）：市场与用户、产品路线图、商业模式、融资与里程碑、风险与合规。

## 本地预览

```powershell
.\serve.ps1
```

或任意静态服务器打开本目录下的 `index.html`。
