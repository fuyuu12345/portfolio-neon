# Family light social - question template factory (PowerShell)
# Usage: powershell -ExecutionPolicy Bypass -File generate.ps1

param(
  [int]$MaxPerTemplate = 60,
  [int]$Seed = 20260805,
  [switch]$NoFrames
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$OutDir = Join-Path $Root "output"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$pools = Get-Content (Join-Path $Root "pools.json") -Encoding UTF8 | ConvertFrom-Json
$templates = Get-Content (Join-Path $Root "templates.json") -Encoding UTF8 | ConvertFrom-Json
$framesDoc = Get-Content (Join-Path $Root "frames.json") -Encoding UTF8 | ConvertFrom-Json
$frames = @($framesDoc.frames)
if ($NoFrames) { $frames = @("{q}") }

# seeded RNG
$script:rng = [System.Random]::new($Seed)
function Get-RandInt([int]$max) {
  if ($max -le 0) { return 0 }
  return $script:rng.Next($max)
}
function Shuffle-List($list) {
  $a = @($list)
  for ($i = $a.Count - 1; $i -gt 0; $i--) {
    $j = Get-RandInt ($i + 1)
    $tmp = $a[$i]; $a[$i] = $a[$j]; $a[$j] = $tmp
  }
  return $a
}

function Resolve-Pool($nameOrList) {
  if ($nameOrList -is [string]) {
    $val = $pools.$nameOrList
    if ($null -eq $val) { throw "Pool not found: $nameOrList" }
    return @($val)
  }
  return @($nameOrList)
}

function Get-Options($template) {
  if ($template.options) {
    $i = 0
    return @($template.options | ForEach-Object {
      [pscustomobject]@{
        key  = [char](65 + $i)
        text = $_.text
        axis = $(if ($_.axis) { $_.axis } else { "opt_$i" })
      }
      $i++
    })
  }

  $poolName = $template.optionsPool
  if (-not $poolName) { throw "Template $($template.id) missing options" }

  if ($poolName -eq "true_reasons_as_options") {
    $picked = @(Shuffle-List @($pools.true_reasons)) | Select-Object -First 4
    $i = 0
    return @($picked | ForEach-Object {
      [pscustomobject]@{
        key  = [char](65 + $i)
        text = $_
        axis = "reason_$i"
      }
      $i++
    })
  }

  $raw = Resolve-Pool $poolName
  $i = 0
  return @($raw | ForEach-Object {
    if ($_ -is [string]) {
      [pscustomobject]@{ key = [char](65 + $i); text = $_; axis = "opt_$i" }
    } else {
      [pscustomobject]@{
        key  = [char](65 + $i)
        text = $_.text
        axis = $(if ($_.axis) { $_.axis } else { "opt_$i" })
      }
    }
    $i++
  })
}

function Fill-Question([string]$pattern, $vars) {
  $result = $pattern
  foreach ($k in $vars.Keys) {
    $result = $result.Replace("{{$k}}", [string]$vars[$k])
  }
  return $result
}

function Sample-Combos($entries, [int]$maxN) {
  if ($entries.Count -eq 0) { return @(@{}) }
  if ($entries.Count -eq 1) {
    $key = $entries[0].Key
    $values = @(Shuffle-List $entries[0].Values)
    $out = @()
    foreach ($v in ($values | Select-Object -First $maxN)) {
      $out += @{ $key = $v }
    }
    return $out
  }

  $out = @()
  $seen = @{}
  $tries = 0
  $guard = $maxN * 20
  while ($out.Count -lt $maxN -and $tries -lt $guard) {
    $tries++
    $row = @{}
    $sigParts = @()
    foreach ($e in $entries) {
      $vals = @($e.Values)
      $v = $vals[(Get-RandInt $vals.Count)]
      $row[$e.Key] = $v
      $sigParts += "$($e.Key)=$v"
    }
    $sig = $sigParts -join "|"
    if ($seen.ContainsKey($sig)) { continue }
    $seen[$sig] = $true
    $out += $row
  }
  return $out
}

function Get-SlugId($layer, $templateId, [int]$index, [string]$question) {
  $md5 = [System.Security.Cryptography.MD5]::Create()
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($question)
  $hex = ([BitConverter]::ToString($md5.ComputeHash($bytes)) -replace "-", "").Substring(0, 8).ToLower()
  return ("{0}-{1}-{2:d3}-{3}" -f $layer, $templateId, $index, $hex)
}

$seenQ = @{}
$questions = New-Object System.Collections.Generic.List[object]
$perTemplate = @{}

foreach ($tpl in $templates) {
  $maxN = if ($tpl.maxExpand) { [int]$tpl.maxExpand } else { $MaxPerTemplate }
  $slotObj = $tpl.slots
  $slotKeys = @()
  if ($slotObj) {
    $slotKeys = @($slotObj.PSObject.Properties.Name)
  }

  $items = @()
  if ($tpl.fixed -or $slotKeys.Count -eq 0) {
    $items += [pscustomobject]@{
      templateId   = $tpl.id
      layer        = $tpl.layer
      tags         = @($tpl.tags)
      question     = $tpl.question
      options      = @(Get-Options $tpl)
      sensitivity  = $(if ($tpl.sensitivity) { $tpl.sensitivity } else { "normal" })
      expandSource = "fixed"
      slots        = $null
    }
  } else {
    $entries = @()
    foreach ($k in $slotKeys) {
      $entries += [pscustomobject]@{ Key = $k; Values = @(Resolve-Pool $slotObj.$k) }
    }
    $refresh = ($tpl.optionsPool -eq "true_reasons_as_options")
    $shared = $null
    if (-not $refresh) { $shared = @(Get-Options $tpl) }
    $combos = Sample-Combos $entries $maxN
    foreach ($vars in $combos) {
      $items += [pscustomobject]@{
        templateId   = $tpl.id
        layer        = $tpl.layer
        tags         = @($tpl.tags)
        question     = (Fill-Question $tpl.question $vars)
        options      = $(if ($refresh) { @(Get-Options $tpl) } else { $shared })
        sensitivity  = $(if ($tpl.sensitivity) { $tpl.sensitivity } else { "normal" })
        expandSource = $(if ($tpl.expandMode) { $tpl.expandMode } elseif ($entries.Count -gt 1) { "pairSample" } else { "each" })
        slots        = $vars
      }
    }
  }

  $kept = 0
  foreach ($item in $items) {
    $baseQ = $item.question.Trim()
    foreach ($frame in $frames) {
      $text = $frame.Replace("{q}", $baseQ)
      # Avoid awkward double framing on already long stems
      if ($frame -ne "{q}" -and $baseQ.Length -gt 42) { continue }
      $key = $text.Trim()
      if ($seenQ.ContainsKey($key)) { continue }
      $seenQ[$key] = $true
      $q = [ordered]@{
        id           = (Get-SlugId $item.layer $item.templateId $kept $key)
        templateId   = $item.templateId
        layer        = $item.layer
        tags         = @($item.tags)
        question     = $key
        options      = @($item.options | ForEach-Object {
          [ordered]@{ key = [string]$_.key; text = $_.text; axis = $_.axis }
        })
        sensitivity  = $item.sensitivity
        expandSource = $item.expandSource
        frame        = $frame
      }
      if ($item.slots) { $q.slots = $item.slots }
      $questions.Add($q) | Out-Null
      $kept++
    }
  }
  $perTemplate[$tpl.id] = $kept
}

$layerOrder = @{ L1 = 1; L2 = 2; L3 = 3; L4 = 4 }
$sorted = $questions | Sort-Object @{ Expression = { $layerOrder[$_.layer] } }, templateId, id

$byLayer = @{
  L1 = @($sorted | Where-Object { $_.layer -eq "L1" }).Count
  L2 = @($sorted | Where-Object { $_.layer -eq "L2" }).Count
  L3 = @($sorted | Where-Object { $_.layer -eq "L3" }).Count
  L4 = @($sorted | Where-Object { $_.layer -eq "L4" }).Count
}

$stats = [ordered]@{
  generatedAt     = (Get-Date).ToUniversalTime().ToString("o")
  seed            = $Seed
  maxPerTemplate  = $MaxPerTemplate
  templateCount   = @($templates).Count
  questionCount   = @($sorted).Count
  byLayer         = $byLayer
  sensitiveCount  = @($sorted | Where-Object { $_.sensitivity -eq "sensitive" }).Count
  perTemplate     = $perTemplate
}

$playMeta = Get-Content (Join-Path $Root "play.json") -Encoding UTF8 | ConvertFrom-Json
$payload = [ordered]@{
  version   = "1.0.0"
  product   = "family-light-social"
  feature   = $playMeta.feature
  play      = $playMeta.play
  stats     = $stats
  questions = @($sorted)
}

$jsonPath = Join-Path $OutDir "questions.json"
$statsPath = Join-Path $OutDir "stats.json"
$csvPath = Join-Path $OutDir "questions.csv"

# JSON via .NET for unicode
$jsonSettings = New-Object System.Collections.Specialized.OrderedDictionary
# Use ConvertTo-Json -Depth
$payload | ConvertTo-Json -Depth 10 | Set-Content -Path $jsonPath -Encoding UTF8
$stats | ConvertTo-Json -Depth 10 | Set-Content -Path $statsPath -Encoding UTF8

# CSV
$utf8Bom = New-Object System.Text.UTF8Encoding $true
$sw = New-Object System.IO.StreamWriter($csvPath, $false, $utf8Bom)
$sw.WriteLine("id,layer,templateId,tags,question,optionA,optionB,optionC,optionD,axes,sensitivity")
function Esc([string]$s) {
  if ($null -eq $s) { return '""' }
  return '"' + ($s.Replace('"', '""')) + '"'
}
foreach ($q in $sorted) {
  $opts = @($q.options)
  $axes = ($opts | ForEach-Object { $_.axis }) -join "|"
  $line = @(
    (Esc $q.id),
    (Esc $q.layer),
    (Esc $q.templateId),
    (Esc (($q.tags) -join "|")),
    (Esc $q.question),
    (Esc $(if ($opts.Count -gt 0) { $opts[0].text } else { "" })),
    (Esc $(if ($opts.Count -gt 1) { $opts[1].text } else { "" })),
    (Esc $(if ($opts.Count -gt 2) { $opts[2].text } else { "" })),
    (Esc $(if ($opts.Count -gt 3) { $opts[3].text } else { "" })),
    (Esc $axes),
    (Esc $q.sensitivity)
  ) -join ","
  $sw.WriteLine($line)
}
$sw.Close()

Write-Host "DONE question-factory"
Write-Host ("templates: {0}" -f $stats.templateCount)
Write-Host ("questions: {0}" -f $stats.questionCount)
Write-Host ("layers L1={0} L2={1} L3={2} L4={3}" -f $byLayer.L1, $byLayer.L2, $byLayer.L3, $byLayer.L4)
Write-Host ("sensitive: {0}" -f $stats.sensitiveCount)
Write-Host ("out: {0}" -f $OutDir)
