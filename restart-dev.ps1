# PowerShell script to clear Next.js cache and restart dev server
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Cache cleared!" -ForegroundColor Green
} else {
    Write-Host "No cache found." -ForegroundColor Gray
}

Write-Host "Starting Next.js dev server..." -ForegroundColor Yellow
npm run dev

