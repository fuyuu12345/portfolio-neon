# 作品集霓虹 · 腾讯云 COS 静态站

国内稳定打开现站（不用重做页面）。GitHub 继续当源码仓。

---

## 一、控制台开通（约 10 分钟）

1. 打开 [腾讯云 COS](https://console.cloud.tencent.com/cos)
2. **创建存储桶**
   - 名称随意，如 `portfolio-neon`
   - 地域：`上海` / `北京` / `广州` 任一
   - 访问权限：先选**公有读私有写**（静态站公开访问）
3. 进入桶 → **基础配置 → 静态网站**
   - 开启
   - 索引文档：`index.html`
   - 错误文档：可先空，或也填 `index.html`
4. 记下 **静态网站域名**（形如 `https://portfolio-neon-xxxxx.cos-website.ap-shanghai.myqcloud.com`）

> 默认 COS 域名有时会被浏览器提示风险；正式对外建议再绑 **CDN**（可仍用腾讯默认 CDN 域名先测）。

---

## 二、上传内容

### 方式 A：控制台拖拽（最快试通）

把仓库里这些目录/文件上传到桶**根路径**（保持相对路径不变）：

- `preview/`（整夹）
- `cases/`
- `products/`
- `js/`
- `assets/`（若在仓库根）
- `css/`（若在仓库根，旧站用；可传可不传）

再单独上传本目录的 `root-index.html`，在桶里命名为根路径的 **`index.html`**（覆盖旧的 AFTER HOURS 首页）。

### 方式 B：脚本同步

1. 安装 [coscli](https://cloud.tencent.com/document/product/436/63144)
2. `config.example.ps1` 复制为 `config.local.ps1`，填 Bucket / Region / 密钥  
   （密钥在 [API 密钥管理](https://console.cloud.tencent.com/cam/capi) 创建；**不要发到聊天、不要提交 git**）
3. PowerShell：

```powershell
cd deploy\tencent-cos
.\sync.ps1
```

---

## 三、发给别人的链接

把 `<桶静态网站域名>` 换成你的：

| 用途 | 链接 |
|------|------|
| 自动跳转（推荐） | `https://<桶静态网站域名>/` |
| 电脑版 | `https://<桶静态网站域名>/preview/index.html` |
| 手机版 | `https://<桶静态网站域名>/preview/mobile/index.html` |
| Oura 案 | `https://<桶静态网站域名>/cases/oura-ring/index.html` |
| 喜茶案 | `https://<桶静态网站域名>/cases/heytea-valorant/index.html` |
| 家灯预览 | `https://<桶静态网站域名>/products/family-light-social/miniprogram/preview.html` |
| 问卷 Demo | `https://<桶静态网站域名>/products/feminist-survey/index.html` |
| ECHO 入口（选网页/手机） | `https://<桶静态网站域名>/products/echo-yesido/` |
| ECHO 网页版 | `https://<桶静态网站域名>/products/echo-yesido/web/` |
| ECHO 手机版 | `https://<桶静态网站域名>/products/echo-yesido/mobile/` |

---

## 四、改完怎么更新

本地改代码 → 再跑一次 `sync.ps1`（或控制台覆盖上传）→ 浏览器强刷。  
GitHub Push 与 COS 上传是两步；需要的话以后可再加 GitHub Action 自动同步。

---

## 五、常见问题

- **403**：桶权限不是公有读，或静态网站未开  
- **样式丢失**：路径没按仓库结构传（例如只传了 html 没传 css/js）  
- **手机还是旧页**：换链接或加 `?v=日期` 防缓存  
- **自定义域名**：需备案；先用默认域名验证作品即可  
