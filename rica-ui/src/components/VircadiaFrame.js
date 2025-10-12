import React, { useState } from 'react';
import './IframeContainer.css';
import './VircadiaFrame.css';

/**
 * VircadiaFrame - Component for embedding the Vircadia metaverse platform
 * This component renders an iframe that loads the Vircadia web interface
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onError - Callback function for iframe load errors
 * @returns {JSX.Element} The VircadiaFrame component
 */
export default function VircadiaFrame({ onError }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  return (
    <div className="iframe-container vircadia-frame-wrapper">
      <iframe
        src="http://localhost:2023"
        title="Vircadia Metaverse"
        className="external-iframe"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals allow-top-navigation"
        allow="clipboard-read; clipboard-write; microphone; camera; fullscreen; xr-spatial-tracking"
        onLoad={() => setIframeLoaded(true)}
        onError={() => onError && onError()}
      />
    </div>
  );
}
