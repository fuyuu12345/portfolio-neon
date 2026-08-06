$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:8765/")
$listener.Start()
Write-Host "SERVING http://127.0.0.1:8765/"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $rel = $ctx.Request.Url.LocalPath.TrimStart("/")
  if ([string]::IsNullOrEmpty($rel)) { $rel = "index.html" }
  $path = Join-Path $root $rel
  if (-not (Test-Path $path)) {
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
    default { "application/octet-stream" }
  }
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $ctx.Response.Close()
}
