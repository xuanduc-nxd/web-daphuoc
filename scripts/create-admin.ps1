param(
    [Parameter(Mandatory = $true)][string]$Username,
    [string]$Name = "",
    [ValidateSet("admin", "editor")][string]$Role = "admin"
)
$ErrorActionPreference = "Stop"
$setupSecret = Read-Host "Mật khẩu quản trị (ít nhất 12 ký tự)" -AsSecureString
$setupPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($setupSecret)
$previousSetupPassword = $env:ADMIN_SETUP_PASSWORD
try {
    $env:ADMIN_SETUP_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($setupPointer)
    $setupArguments = @("--username", $Username, "--role", $Role)
    if ($Name.Trim() -ne "") { $setupArguments += @("--name", $Name) }
    & php (Join-Path $PSScriptRoot "create-admin.php") @setupArguments
    if ($LASTEXITCODE -ne 0) { throw "Không tạo được tài khoản. Kiểm tra thông báo phía trên." }
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($setupPointer)
    if ($null -eq $previousSetupPassword) { Remove-Item Env:ADMIN_SETUP_PASSWORD -ErrorAction SilentlyContinue }
    else { $env:ADMIN_SETUP_PASSWORD = $previousSetupPassword }
    $setupSecret.Dispose()
}
