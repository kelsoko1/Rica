import React, { useState } from 'react';
import './IframeContainer.css';

export default function AutoFrame({ onError }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  return (
    <div className="iframe-container">
      <iframe
        src="http://localhost:2022"
        title="Activepieces Automation"
        className="external-iframe"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
        allow="clipboard-read; clipboard-write"
        onLoad={() => setIframeLoaded(true)}
        onError={() => onError && onError()}
      />
    </div>
  );
}
