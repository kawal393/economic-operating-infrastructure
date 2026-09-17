<#
.SYNOPSIS
  Build sovereign-ai.services here, ship it to our own VPS, swap it in, verify.

.DESCRIPTION
  This is the replacement for the vendor deploy pipeline. There is no dashboard,
  no "Sync from GitHub", no Publish button and no waiting to see whether the
  provider's automation felt like running today (EMPIRE_STATE.md §15(i): a push
  is not a deploy; §16 Sep 2026: the vendor edge was found serving a build older
  than GitHub HEAD while claiming to auto-deploy).

  The build happens on this machine because the VPS has 1 GB of RAM and a Vite
  build there competes with apex-spine. What ships is the finished .output tree.

  The remote swap is guarded: it refuses to restart the service unless the
  signing seed is present in the remote .env, because a restart without
  NATION_SIGNING_SEED turns every signed endpoint into a 500 while the marketing
  pages still look alive.

.PARAMETER VpsIp
  Destination host. Defaults to the ExtraVM Singapore box.

.PARAMETER SkipBuild
  Ship the existing .output tree without rebuilding.

.EXAMPLE
  pwsh deploy/deploy-to-vps.ps1
  pwsh deploy/deploy-to-vps.ps1 -SkipBuild -PublicBase http://199.119.136.64:3100
#>
param(
  [string]$VpsIp = "199.119.136.64",
  [string]$RemoteDir = "/root/sovereign-ai",
  [string]$Key = "$env:USERPROFILE\.ssh\apex_vps",
  [string]$PublicBase = "https://sovereign-ai.services",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

$sshArgs = @("-i", $Key, "-o", "StrictHostKeyChecking=accept-new", "root@$VpsIp")

function Invoke-Remote([string]$script) {
  $tmp = Join-Path $env:TEMP ("sovereign-remote-" + [guid]::NewGuid().ToString("n") + ".sh")
  # LF endings, no BOM: a CRLF shell script fails on Linux with "$'\r': command not found".
  [IO.File]::WriteAllText($tmp, ($script -replace "`r`n", "`n"))
  try {
    Get-Content $tmp -Raw | ssh @sshArgs "bash -s"
    if ($LASTEXITCODE -ne 0) { throw "remote step failed with exit $LASTEXITCODE" }
  } finally {
    Remove-Item $tmp -ErrorAction SilentlyContinue
  }
}

# --- 1. BUILD ---------------------------------------------------------------
if (-not $SkipBuild) {
  Write-Host "[1/5] building (nitro preset: node-server)" -ForegroundColor Cyan
  $env:NITRO_PRESET = "node-server"
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "vite build failed" }
} else {
  Write-Host "[1/5] skipping build (-SkipBuild)" -ForegroundColor Yellow
}

$nitroJson = Get-Content ".output/nitro.json" -Raw | ConvertFrom-Json
if ($nitroJson.preset -ne "node-server") {
  throw ".output was built for preset '$($nitroJson.preset)'. This script ships node-server builds only."
}
Write-Host "      preset confirmed: $($nitroJson.preset) @ $($nitroJson.date)"

# --- 2. PACKAGE -------------------------------------------------------------
Write-Host "[2/5] packing .output" -ForegroundColor Cyan
$tarball = Join-Path $env:TEMP "sovereign-release.tgz"
if (Test-Path $tarball) { Remove-Item $tarball }
tar -czf $tarball -C .output .
if ($LASTEXITCODE -ne 0) { throw "tar failed" }
$size = [math]::Round((Get-Item $tarball).Length / 1MB, 2)
Write-Host "      $tarball ($size MB)"

# --- 3. SHIP ----------------------------------------------------------------
Write-Host "[3/5] shipping to root@${VpsIp}:$RemoteDir" -ForegroundColor Cyan
Invoke-Remote @"
set -e
mkdir -p '$RemoteDir'
if [ ! -s '$RemoteDir/.env' ]; then
  echo 'FATAL: $RemoteDir/.env is missing or empty.'
  echo 'Copy .env.example there, fill it in, chmod 600. Nothing will be swapped.'
  exit 3
fi
if ! grep -Eq '^NATION_SIGNING_SEED=("?)[^"]+\1' '$RemoteDir/.env'; then
  echo 'FATAL: NATION_SIGNING_SEED is not set in $RemoteDir/.env.'
  echo 'Refusing to restart: signed endpoints would 500 while pages still render.'
  exit 4
fi
echo 'env guard passed'
"@
scp -i $Key -o StrictHostKeyChecking=accept-new $tarball "root@${VpsIp}:/root/sovereign-release.tgz"
if ($LASTEXITCODE -ne 0) { throw "scp failed" }

# --- 4. SWAP + RESTART ------------------------------------------------------
Write-Host "[4/5] swapping and restarting service" -ForegroundColor Cyan
Invoke-Remote @"
set -e
cd '$RemoteDir'
# Nothing is ever deleted here. Stale trees are moved aside and pruned by hand,
# so a bad swap can always be walked back.
if [ -e .output.incoming ]; then mv .output.incoming ".output.incoming.stale-`$(date +%Y%m%d-%H%M%S)"; fi
mkdir -p .output.incoming
tar -xzf /root/sovereign-release.tgz -C .output.incoming
test -s .output.incoming/server/index.mjs || { echo 'FATAL: incoming tree has no server entry'; exit 5; }
systemctl stop sovereign-ai 2>/dev/null || true
if [ -d .output ]; then
  stamp=`$(date +%Y%m%d-%H%M%S)
  mv .output ".output.prev-`$stamp.bak"
fi
mv .output.incoming .output
systemctl daemon-reload
systemctl restart sovereign-ai
sleep 3
code=`$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3100/)
echo "loopback health: HTTP `$code"
[ "`$code" = "200" ] || { echo 'FATAL: service did not answer 200 on loopback'; journalctl -u sovereign-ai -n 40 --no-pager; exit 6; }
systemctl is-active sovereign-ai
"@

# --- 5. VERIFY FROM HERE ----------------------------------------------------
Write-Host "[5/5] verifying $PublicBase" -ForegroundColor Cyan
& (Join-Path $PSScriptRoot "verify-sovereign.ps1") -Base $PublicBase

Write-Host ""
Write-Host "Done. Rollback = ssh in, mv the newest .output.prev-*.bak back to .output, restart the unit." -ForegroundColor Green
Write-Host "Housekeeping: old .output.prev-*.bak trees accumulate on the VPS - prune them by hand once a release has held for a day." -ForegroundColor DarkGray
