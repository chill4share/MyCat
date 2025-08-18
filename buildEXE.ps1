# buildEXE.ps1 - Build Tauri app + tao latest.json canh file exe

function Log($msg, $color = "White") {
    Write-Host ("[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $msg) -ForegroundColor $color
}

# Cho phep chay script tam thoi
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

Clear-Host
Log "=== BAT DAU QUY TRINH BUILD TAURI ===" Cyan

# 1. Load private key
$keyPath = "src-tauri/private.key"
if (-Not (Test-Path $keyPath)) {
    Log "Khong tim thay private.key tai $keyPath" Red
    exit 1
}
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content $keyPath -Raw
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ""
Log "Da nap private key" Green

# 2. Lay version tu package.json
$pkgPath = "package.json"
if (-Not (Test-Path $pkgPath)) {
    Log "Khong tim thay package.json" Red
    exit 1
}
$pkg = Get-Content $pkgPath | ConvertFrom-Json
$version = $pkg.version
Log "Phien ban: $version" Yellow

# 3. Don output cu
$outputDirs = @("dist", "target/release/bundle/nsis")
foreach ($dir in $outputDirs) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
        Log "Da xoa thu muc cu: $dir" DarkGray
    }
}

# 4. Build Tauri
Log "Dang build..." Cyan
pnpm tauri build
if ($LASTEXITCODE -ne 0) {
    Log "Build that bai" Red
    exit 1
}
Log "Build ung dung thanh cong." Green

# 5. Thu muc bundle
$bundleDir = "target/release/bundle/nsis"
if (-Not (Test-Path $bundleDir)) {
    Log "Khong tim thay thu muc NSIS bundle" Red
    exit 1
}

# 6. Tim file exe moi nhat
$exeFile = Get-ChildItem $bundleDir -Filter "*.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-Not $exeFile) {
    Log "Khong tim thay file exe" Red
    exit 1
}

# 7. Tim file sig moi nhat
$sigFile = Get-ChildItem $bundleDir -Filter "*.sig" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-Not $sigFile) {
    Log "Khong tim thay file sig" Red
    exit 1
}
$signature = Get-Content $sigFile.FullName -Raw

Log "File exe: $($exeFile.Name)" Green
Log "File sig: $($sigFile.Name)" Green

# 8. Tao latest.json (UTF-8 khong BOM)
$latestJsonPath = Join-Path $bundleDir "latest.json"

# Ghi chu: noi nhieu dong thanh mot string co \n
$notesArray = @(
    "Ghi chu dong 1: Them tinh nang moi.",
    "Ghi chu dong 2: Sua loi quan trong.",
    "Ghi chu dong 3: Cai thien giao dien nguoi dung."
)
$notesString = ($notesArray -join "`n")

$latestData = @{
    version   = $version
    notes     = $notesString
    pub_date  = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    platforms = @{
        "windows-x86_64" = @{
            signature = $signature
            url       = "https://github.com/chill4share/MyCat/releases/download/v$version/$($exeFile.Name)"
        }
    }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($latestJsonPath, ($latestData | ConvertTo-Json -Depth 10), $utf8NoBom)

Log "Da tao latest.json tai: $latestJsonPath" Green

# 9. Hoan tat
Log "=== HOAN TAT QUY TRINH BUILD ===" Cyan
Log "Cac file can upload len GitHub Releases:" Yellow
Log " - $($exeFile.Name)" White
Log " - $($sigFile.Name)" White
Log " - latest.json" White
