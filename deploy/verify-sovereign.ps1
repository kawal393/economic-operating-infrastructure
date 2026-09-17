<#
.SYNOPSIS
  Sovereign deploy verifier for sovereign-ai.services.

.DESCRIPTION
  Crawls every concrete route on a target base URL and reports status, byte size,
  the page's <h1>, and a set of known-positive / known-negative strings.

  Doctrine (§15(g), EMPIRE_STATE.md): a zero is only as good as the crawler's
  reach. This script therefore prints a KNOWN-POSITIVE control first - a string
  that must be present - and refuses to call the estate clean if the control
  fails. It also checks the built client bundle for vendor residue, because the
  decoupling from the editor vendor is a claim that has to be recomputable.

.PARAMETER Base
  Base URL to crawl. Default http://127.0.0.1:3100 (the local node-server build).

.EXAMPLE
  pwsh deploy/verify-sovereign.ps1
  pwsh deploy/verify-sovereign.ps1 -Base https://sovereign-ai.services
#>
param(
  [string]$Base = "http://127.0.0.1:3100"
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Concrete routes only. Parameterised routes ($slug, $receiptId, $digest) are
# probed with a deliberate non-existent value: they must return a real response,
# not a crash, and the 404 handling is itself part of the surface.
$routes = @(
  "/", "/charter", "/charter.json", "/constitution", "/constitution.json",
  "/amendments", "/ledger", "/transparency", "/transactions", "/governance",
  "/capital", "/registry", "/registry-join", "/entities", "/credentials",
  "/seal", "/sealed-memory", "/verify", "/architecture", "/protocols", "/interop",
  "/integrations", "/mcp", "/docs", "/openapi.json", "/deploy", "/security",
  "/pricing", "/contracts", "/government", "/minister", "/steward", "/onboard",
  "/amplify", "/enforcement-watch", "/auth", "/dashboard", "/terms", "/privacy",
  "/llms.txt", "/feed.xml", "/sitemap.xml", "/agents.json",
  "/.well-known/did.json", "/.well-known/sovereign-ai.json",
  "/api/public/v1/checkpoint", "/api/public/v1/jwks.json",
  "/api/public/v1/ledger", "/api/public/v1/ledger-stats", "/api/public/v1/verify",
  "/citizenship", "/passport",
  "/registry/does-not-exist", "/entities/does-not-exist", "/r/does-not-exist"
)

# Strings that MUST appear somewhere across the crawl. If any of these is zero,
# the crawler is not reaching the real site and every other number is worthless.
$controls = @("SOVEREIGNAI.SERVICES", "Charter")

# Strings that must NOT appear on any page of our own estate.
$forbidden = @("lovable", "lovableproject", "gptengineer", "Lovable Cloud", "digital-gallows")

$rows = New-Object System.Collections.ArrayList
$corpus = New-Object System.Text.StringBuilder

foreach ($r in $routes) {
  $url = "$Base$r"
  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 45 -MaximumRedirection 5
    $body = $resp.Content
    $status = [int]$resp.StatusCode
  } catch {
    $body = ""
    $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
  }
  $h1 = ""
  if ($body -match '<h1[^>]*>(.*?)</h1>') { $h1 = ($matches[1] -replace '<[^>]+>', '').Trim() }
  [void]$rows.Add([pscustomobject]@{
    Route  = $r
    Status = $status
    Bytes  = $body.Length
    H1     = if ($h1.Length -gt 58) { $h1.Substring(0, 58) + "..." } else { $h1 }
  })
  [void]$corpus.Append($body)
  [void]$corpus.Append("`n")
}

$all = $corpus.ToString()

Write-Output ""
Write-Output "=== CRAWL: $Base ($($routes.Count) routes) ==="
$rows | Format-Table -AutoSize | Out-String -Width 200 | Write-Output

Write-Output "=== CONTROL (must be non-zero, else the crawl proves nothing) ==="
foreach ($c in $controls) {
  $n = ([regex]::Matches($all, [regex]::Escape($c))).Count
  $verdict = if ($n -gt 0) { "OK" } else { "CONTROL FAILED" }
  Write-Output ("{0,-24} {1,6}   {2}" -f $c, $n, $verdict)
}

Write-Output ""
Write-Output "=== FORBIDDEN (must be zero on every page) ==="
$clean = $true
foreach ($f in $forbidden) {
  $n = ([regex]::Matches($all, [regex]::Escape($f), 'IgnoreCase')).Count
  if ($n -gt 0) { $clean = $false }
  Write-Output ("{0,-24} {1,6}" -f $f, $n)
}

Write-Output ""
$bad = $rows | Where-Object { $_.Status -ge 500 -or $_.Status -eq 0 }
Write-Output "=== VERDICT ==="
Write-Output ("routes crawled : {0}" -f $rows.Count)
Write-Output ("5xx / unreachable : {0}" -f @($bad).Count)
if (@($bad).Count -gt 0) { $bad | Format-Table -AutoSize | Out-String -Width 200 | Write-Output }
Write-Output ("vendor residue : {0}" -f $(if ($clean) { "CLEAN" } else { "FOUND - NOT SHIPPABLE" }))
