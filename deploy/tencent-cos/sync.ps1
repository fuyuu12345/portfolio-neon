# 作品集霓虹 → 腾讯云 COS 静态站同步
# 用法：先复制 config.example.ps1 为 config.local.ps1 并填密钥，再运行本脚本

$ErrorActionPreference = "Stop"
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path (Join-Path $Here "..\..")).Path
$ConfigLocal = Join-Path $Here "config.local.ps1"

if (-not (Test-Path $ConfigLocal)) {
  Write-Host "缺少 config.local.ps1。请复制 config.example.ps1 后填写密钥。" -ForegroundColor Yellow
  exit 1
}

. $ConfigLocal

if (-not $Bucket -or -not $Region -or -not $SecretId -or -not $SecretKey) {
  Write-Host "config.local.ps1 里 Bucket / Region / SecretId / SecretKey 需填完整。" -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path $CosCli)) {
  Write-Host "未找到 coscli：$CosCli" -ForegroundColor Yellow
  Write-Host "下载：https://cloud.tencent.com/document/product/436/63144" -ForegroundColor Cyan
  Write-Host "或先用控制台手动上传（见 README.md）。" -ForegroundColor Cyan
  exit 1
}

$env:COS_SECRETID = $SecretId
$env:COS_SECRETKEY = $SecretKey

# 排除源码/工具目录，只同步站点需要的内容
$Exclude = @(
  ".git/*",
  ".cursor/*",
  "node_modules/*",
  "snapshots/*",
  "deploy/tencent-cos/config.local.ps1",
  "**/*.ps1",
  "**/serve*.ps1",
  "products/family-light-social/miniprogram/node_modules/*"
)

Write-Host "Repo: $RepoRoot"
Write-Host "Dest: cos://$Bucket/ ($Region)"
Write-Host ""

# 同步仓库（coscli sync）
& $CosCli sync $RepoRoot "cos://$Bucket/" -r $Region `
  --exclude ".git/*" `
  --exclude ".cursor/*" `
  --exclude "node_modules/*" `
  --exclude "snapshots/*" `
  --exclude "deploy/tencent-cos/config.local.ps1" `
  --delete=false

if ($LASTEXITCODE -ne 0) {
  Write-Host "sync 失败，请检查 coscli 配置与桶权限。" -ForegroundColor Red
  exit $LASTEXITCODE
}

# 覆盖根 index 为智能跳转（电脑→preview，手机→preview/mobile）
$RootIndex = Join-Path $Here "root-index.html"
& $CosCli cp $RootIndex "cos://$Bucket/index.html" -r $Region `
  --headers "Content-Type: text/html; charset=utf-8"

Write-Host ""
Write-Host "完成。控制台开启「静态网站」后，用默认域名访问即可。" -ForegroundColor Green
Write-Host "电脑: https://<桶域名>/preview/index.html"
Write-Host "手机: https://<桶域名>/preview/mobile/index.html"
Write-Host "根路径会自动跳转。"
