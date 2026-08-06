# 局域网手机预览：手机与电脑同一 Wi-Fi，浏览器打开脚本打印的地址
param(
  [int]$Port = 8767,
  [string]$Root = $PSScriptRoot
)

$ip = (
  Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {
    $_.IPAddress -notlike '127.*' -and
    $_.IPAddress -notlike '169.254.*' -and
    $_.PrefixOrigin -ne 'WellKnown'
  } |
  Sort-Object InterfaceIndex |
  Select-Object -First 1
).IPAddress

if (-not $ip) {
  $ip = (
    Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*' } |
    Select-Object -First 1
  ).IPAddress
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
try {
  $listener.Start()
} catch {
  Write-Host "端口 $Port 启动失败：$($_.Exception.Message)"
  Write-Host "可改端口：.\serve-phone.ps1 -Port 8788"
  exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host " 手机浏览器打开（同一 Wi-Fi）："
Write-Host " http://${ip}:${Port}/preview.html"
Write-Host "========================================"
Write-Host " 电脑：http://127.0.0.1:${Port}/preview.html"
Write-Host " 按 Ctrl+C 停止"
Write-Host ""

function Get-ContentType([string]$ext) {
  switch ($ext.ToLower()) {
    '.html' { 'text/html; charset=utf-8' }
    '.css'  { 'text/css; charset=utf-8' }
    '.js'   { 'application/javascript; charset=utf-8' }
    '.png'  { 'image/png' }
    '.jpg'  { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.svg'  { 'image/svg+xml' }
    '.json' { 'application/json; charset=utf-8' }
    default { 'application/octet-stream' }
  }
}

function Send-Response($stream, [int]$code, [string]$ctype, [byte[]]$body) {
  $reason = switch ($code) { 200 { 'OK' } 403 { 'Forbidden' } 404 { 'Not Found' } default { 'Error' } }
  $header = "HTTP/1.1 $code $reason`r`nContent-Type: $ctype`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nAccess-Control-Allow-Origin: *`r`n`r`n"
  $hb = [Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($hb, 0, $hb.Length)
  if ($body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
}

$rootFull = [IO.Path]::GetFullPath($Root)

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $stream.ReadTimeout = 5000
    $buf = New-Object byte[] 8192
    $n = $stream.Read($buf, 0, $buf.Length)
    if ($n -le 0) { continue }
    $req = [Text.Encoding]::UTF8.GetString($buf, 0, $n)
    $line = ($req -split "`r`n")[0]
    if ($line -notmatch '^(GET|HEAD)\s+(\S+)') {
      Send-Response $stream 404 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('bad request'))
      continue
    }
    $rawPath = $Matches[2]
    if ($rawPath -match '^([^?]+)') { $rawPath = $Matches[1] }
    $path = [Uri]::UnescapeDataString($rawPath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($path)) { $path = 'preview.html' }
    $file = [IO.Path]::GetFullPath((Join-Path $rootFull $path))
    if (-not $file.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
      Send-Response $stream 403 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('forbidden'))
      continue
    }
    if (-not (Test-Path $file -PathType Leaf)) {
      Send-Response $stream 404 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('not found'))
      continue
    }
    $bytes = [IO.File]::ReadAllBytes($file)
    $ctype = Get-ContentType ([IO.Path]::GetExtension($file))
    Send-Response $stream 200 $ctype $bytes
  } catch {
    # ignore single-request errors
  } finally {
    try { $client.Close() } catch {}
  }
}
