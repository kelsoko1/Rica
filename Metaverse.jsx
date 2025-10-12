// Metaverse.jsx - Spatial Reality Tab Component for Rica UI
// This component provides access to the Vircadia metaverse

import React, { useState, useEffect } from 'react';
import './Metaverse.css';

const Metaverse = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Vircadia Web is accessible
    const checkVircadiaHealth = async () => {
      try {
        const response = await fetch('http://localhost:2024/health');
        if (response.ok) {
          setIsLoading(false);
        } else {
          setError('Vircadia Web is not accessible. Please ensure the service is running.');
        }
      } catch (err) {
        setError('Unable to connect to Vircadia Web. Please start the service first.');
      }
    };

    checkVircadiaHealth();
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="metaverse-container">
        <div className="metaverse-error">
          <h3>🌐 Spatial Reality Unavailable</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()}>
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="metaverse-container">
      {isLoading && (
        <div className="metaverse-loading">
          <div className="loading-spinner"></div>
          <p>Loading Spatial Reality...</p>
        </div>
      )}

      <iframe
        src="http://localhost:2024"
        className="metaverse-iframe"
        title="Vircadia Metaverse"
        onLoad={handleIframeLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
        allow="camera; microphone; fullscreen; autoplay"
      />

      <div className="metaverse-controls">
        <div className="control-info">
          <span className="status-indicator active"></span>
          <span>Spatial Reality Active</span>
        </div>
        <div className="control-buttons">
          <button className="btn-secondary" title="Fullscreen">
            ⛶
          </button>
          <button className="btn-secondary" title="Settings">
            ⚙️
          </button>
        </div>
      </div>
    </div>
  );
};

export default Metaverse;
