# Start SIE Mockdatagenerator (Electron)
$appDir = Join-Path $PSScriptRoot "electron-app"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js hittades inte. Installera Node.js från https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Push-Location $appDir

if (-not (Test-Path "node_modules\electron")) {
    Write-Host "Installerar beroenden (sker bara första gången)..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "npm install misslyckades." -ForegroundColor Red
        Pop-Location; exit 1
    }
}

Write-Host "Startar SIE Mockdatagenerator..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm start" -WorkingDirectory $appDir -WindowStyle Hidden

Pop-Location
