$source = "C:\Users\kelvin\Desktop\Rica\rica-ui\src\components\StarrySidebarClean.js"
$dest = "C:\Users\kelvin\Desktop\Rica\rica-ui\src\components\StarrySidebar.js"

# Read the source file
$content = Get-Content $source -Raw

# Force delete the destination
Remove-Item $dest -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Milliseconds 500

# Write the new content
Set-Content -Path $dest -Value $content -Force

Write-Host "File replaced successfully"
