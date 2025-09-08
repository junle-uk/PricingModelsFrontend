# Clear Next.js cache
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Cache cleared!" -ForegroundColor Green
} else {
    Write-Host "No cache found." -ForegroundColor Gray
}

Write-Host "`nNext.js cache has been cleared. Please restart your dev server." -ForegroundColor Cyan
Write-Host "Run: npm run dev" -ForegroundColor Cyan

