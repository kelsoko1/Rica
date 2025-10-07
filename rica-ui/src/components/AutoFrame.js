import React, { useState } from 'react';
import './IframeContainer.css';
import './AutoFrame.css';

export default function AutoFrame({ onError }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  return (
    <div className="iframe-container auto-frame-wrapper">
      <iframe
        src="http://72.60.133.11:2020"
        title="Activepieces Automation"
        className="external-iframe"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
        allow="clipboard-read; clipboard-write"
        onLoad={() => setIframeLoaded(true)}
        onError={() => onError && onError()}
      />
      {/* CSS overlay to hide Activepieces logo */}
      <div className="logo-overlay"></div>
    </div>
  );
}
