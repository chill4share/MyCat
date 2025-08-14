# buildEXE.ps1 - Build Tauri app + tao latest.json canh file exe (khong dung ConvertTo-Json)

# Cho phep chay script tam thoi
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
Write-Host "=== BAT DAU BUILD TAURI APP ===" -ForegroundColor Cyan

# 0. Don sach output cu nhung giu cache compile
# Xoa dist (frontend)
$distDir = "dist"
if (Test-Path $distDir) {
    Write-Host "Dang xoa thu muc dist cu..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $distDir
}

# Xoa bundle cu (chi output build, khong xoa cache compile)
$bundleDir = "target/release/bundle/nsis"
if (Test-Path $bundleDir) {
    Write-Host "Dang xoa output cu trong $bundleDir ..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $bundleDir\*
}

# 1. Load private key
$keyPath = "src-tauri/private.key"
if (-Not (Test-Path $keyPath)) {
    Write-Host "Khong tim thay private.key tai $keyPath" -ForegroundColor Red
    exit 1
}
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content $keyPath -Raw
Write-Host "Da nap private key" -ForegroundColor Green

# 2. Lay version tu package.json
$pkgPath = "package.json"
if (-Not (Test-Path $pkgPath)) {
    Write-Host "Khong tim thay package.json" -ForegroundColor Red
    exit 1
}
$pkg = Get-Content $pkgPath | ConvertFrom-Json
$version = $pkg.version
Write-Host "Phien ban: $version" -ForegroundColor Yellow

# 3. Build Tauri
Write-Host "Dang build Tauri app..." -ForegroundColor Cyan
pnpm tauri build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build that bai" -ForegroundColor Red
    exit 1
}

# 4. Thu muc bundle (sau khi build)
$bundleDir = "target/release/bundle/nsis"
if (-Not (Test-Path $bundleDir)) {
    $bundleDir = "src-tauri/target/release/bundle/nsis"
}
if (-Not (Test-Path $bundleDir)) {
    Write-Host "Khong tim thay thu muc NSIS bundle" -ForegroundColor Red
    exit 1
}

# 5. Lay file exe va sig
Write-Host "Dang tim file exe..." -ForegroundColor Cyan
$exeFile = Get-ChildItem $bundleDir -Filter "*.exe" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-Not $exeFile) {
    Write-Host "Khong tim thay file exe" -ForegroundColor Red
    exit 1
}

$sigFile = "$($exeFile.FullName).sig"
if (-Not (Test-Path $sigFile)) {
    Write-Host "Khong tim thay file sig" -ForegroundColor Red
    exit 1
}
$signature = Get-Content $sigFile -Raw

Write-Host "File exe: $($exeFile.FullName)" -ForegroundColor Green
Write-Host "File sig: $sigFile" -ForegroundColor Green

# 6. Tao latest.json canh file exe (ghi thu cong)
Write-Host "Dang tao latest.json..." -ForegroundColor Cyan
$latestJsonPath = Join-Path $exeFile.DirectoryName "latest.json"
$pubDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

$latestJsonContent = @"
{
  "version": "$version",
  "notes": "Update log",
  "pub_date": "$pubDate",
  "platforms": {
    "windows-x86_64": {
      "signature": "$signature",
      "url": "https://github.com/chill4share/MyCat/releases/download/v$version/$($exeFile.Name)"
    }
  }
}
"@

$latestJsonContent | Out-File -FilePath $latestJsonPath -Encoding UTF8
Write-Host "Da tao latest.json tai: $latestJsonPath" -ForegroundColor Green

Write-Host "=== HOAN TAT BUILD ===" -ForegroundColor Cyan
