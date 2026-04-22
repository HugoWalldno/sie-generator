# Start SIE Mockdatagenerator
# Run this script from the "SIE mockdata" root folder

Write-Host "Starting backend (http://localhost:5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'backend\SIEGenerator.API'; dotnet run --launch-profile http"

Write-Host "Starting frontend (http://localhost:4200)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'frontend\sie-generator'; npx ng serve"

Write-Host ""
Write-Host "Applikationen startar i bakgrunden." -ForegroundColor Green
Write-Host "  Frontend: http://localhost:4200" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Yellow
