import React, { useState } from 'react';
import './IframeContainer.css';

export default function CodeServerFrame({ onError }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  return (
    <div className="iframe-container">
      <iframe
        src="http://localhost:2021"
        title="Code Server - VS Code in Browser"
        className="external-iframe"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals allow-top-navigation"
        allow="clipboard-read; clipboard-write; fullscreen"
        onLoad={() => setIframeLoaded(true)}
        onError={() => onError && onError()}
      />
    </div>
  );
}
