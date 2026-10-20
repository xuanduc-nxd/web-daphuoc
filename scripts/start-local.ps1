param(
    [ValidateRange(1, 65535)][int]$Port = 8000
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$sessionDir = Join-Path $projectRoot '.ui-test-tools\sessions'
New-Item -ItemType Directory -Force -Path $sessionDir | Out-Null

& php -d "session.save_path=$sessionDir" -d upload_max_filesize=5M -d post_max_size=7M -S "127.0.0.1:$Port" -t (Join-Path $projectRoot 'public')
exit $LASTEXITCODE
