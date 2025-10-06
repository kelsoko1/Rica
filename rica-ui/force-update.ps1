$newContent = @'
import React from 'react';
import './StarrySidebar.css';

export default function StarrySidebar({open, onClose}) {
  if (!open) return null;

  return (
    <div className="starry-sidebar open">
      <div className="starry-header">
        <div className="starry-header-left">
          <div className="starry-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17.75L5.82799 20.995L7.00699 14.122L2.00699 9.255L8.90699 8.255L11.993 2.002L15.079 8.255L21.979 9.255L16.979 14.122L18.158 20.995L12 17.75Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="starry-title">
            <h3>Starry AI</h3>
            <span className="starry-subtitle">Powered by Ollama</span>
          </div>
        </div>
        <div className="starry-header-right">
          <button className="close-btn" onClick={onClose} title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="starry-messages">
        <div className="message assistant">
          <div className="message-avatar">
            <div className="ai-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 17.75L5.82799 20.995L7.00699 14.122L2.00699 9.255L8.90699 8.255L11.993 2.002L15.079 8.255L21.979 9.255L16.979 14.122L18.158 20.995L12 17.75Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <div className="message-content">
            <div className="message-header">
              <span className="message-role">Starry AI</span>
              <span className="message-time">Now</span>
            </div>
            <div className="message-text">
              👋 Hello! I'm Starry AI, powered by Ollama. 
              <br/><br/>
              The Starry AI component is currently being updated. Please check back soon!
            </div>
          </div>
        </div>
      </div>
      
      <div className="starry-input-container">
        <div className="input-wrapper">
          <textarea 
            placeholder="Ask me anything..." 
            rows="1" 
            disabled={true}
          />
          <button className="send-btn" disabled={true}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="input-hint">
          Starry AI is currently being updated
        </div>
      </div>
    </div>
  );
}
'@

$targetFile = "C:\Users\kelvin\Desktop\Rica\rica-ui\src\components\StarrySidebar.js"

# Kill any processes that might have the file open
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait
Start-Sleep -Seconds 2

# Delete the file
Remove-Item $targetFile -Force -ErrorAction SilentlyContinue

# Wait
Start-Sleep -Seconds 1

# Write new content
Set-Content -Path $targetFile -Value $newContent -Force

Write-Host "File updated successfully. Please restart your dev server."
