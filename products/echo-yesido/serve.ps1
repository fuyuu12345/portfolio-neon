$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$port = 8767
$listener = New-Object System.Net.HttpListener
$prefix = "http://127.0.0.1:$port/"
$listener.Prefixes.Add($prefix)
try {
  $listener.Start()
} catch {
  Write-Host "Port $port busy — try closing the old serve window."
  Write-Host $_.Exception.Message
  exit 1
}
Write-Host "SERVING $prefix"
Write-Host "Chooser: ${prefix}"
Write-Host "Web:     ${prefix}web/"
Write-Host "Mobile:  ${prefix}mobile/"
Write-Host "Ctrl+C to stop."
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $rel = $ctx.Request.Url.LocalPath.TrimStart("/")
  if ([string]::IsNullOrEmpty($rel) -or $rel.EndsWith("/")) {
    if ([string]::IsNullOrEmpty($rel) -or $rel -eq "/") { $rel = "index.html" }
    else { $rel = ($rel.TrimEnd("/") + "/index.html") }
  }
  $rel = $rel -replace "/", [IO.Path]::DirectorySeparatorChar
  $path = Join-Path $root $rel
  if ((Test-Path $path) -and (Get-Item $path).PSIsDirectory) {
    $index = Join-Path $path "index.html"
    if (Test-Path $index) { $path = $index } else {
      $ctx.Response.StatusCode = 404
      $ctx.Response.Close()
      continue
    }
  }
  if (-not (Test-Path $path) -or (Get-Item $path).PSIsContainer) {
    $ctx.Response.StatusCode = 404
    $ctx.Response.Close()
    continue
  }
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $ext = [IO.Path]::GetExtension($path).ToLower()
  $ctx.Response.ContentType = switch ($ext) {
    ".html" { "text/html; charset=utf-8" }
    ".css"  { "text/css; charset=utf-8" }
    ".js"   { "application/javascript; charset=utf-8" }
    ".png"  { "image/png" }
    ".jpg"  { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".svg"  { "image/svg+xml" }
    ".webp" { "image/webp" }
    default { "application/octet-stream" }
  }
  $ctx.Response.ContentLength64 = $bytes.Length
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $ctx.Response.Close()
}
