param(
    [ValidateRange(1, 65535)][int]$Port = 8000
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$env:PORT = "$Port"
& node --experimental-strip-types (Join-Path $projectRoot 'src\server.ts')
exit $LASTEXITCODE
