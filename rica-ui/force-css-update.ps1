$targetFile = "C:\Users\kelvin\Desktop\Rica\rica-ui\src\components\StarrySidebar.css"

# Delete the old file
Remove-Item $targetFile -Force -ErrorAction SilentlyContinue

# Wait
Start-Sleep -Milliseconds 500

# Read the new CSS content
$newCSS = @'
/* Rica UI Integrated Starry Sidebar */
.starry-sidebar {
  position: fixed;
  top: 0;
  right: -420px;
  width: 420px;
  height: 100vh;
  background: linear-gradient(180deg, #141a24 0%, #1a212e 100%);
  border-left: 1px solid rgba(30, 39, 54, 0.6);
  z-index: 1000;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.5);
  font-family: 'IBM Plex Sans', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

.starry-sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, rgba(62, 123, 250, 0.3) 0%, rgba(0, 179, 214, 0.2) 100%);
  opacity: 0.6;
  pointer-events: none;
}

.starry-sidebar.open {
  right: 0;
}
'@

# Write the new content
Set-Content -Path $targetFile -Value $newCSS -Force

Write-Host "CSS file updated. Please refresh your browser (Ctrl+Shift+R)"
'@

# Write and execute
Set-Content -Path "C:\Users\kelvin\Desktop\Rica\rica-ui\force-css-update.ps1" -Value $script -Force
