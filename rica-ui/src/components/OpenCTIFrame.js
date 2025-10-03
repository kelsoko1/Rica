import React from 'react';
import './IframeContainer.css';

const OpenCTIFrame = () => {
  const frameStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: '#fff'
  };

  return (
    <div className="iframe-container" style={{ width: '100%', height: '100%' }}>
      <iframe 
        src="http://localhost:2020" 
        title="OpenCTI" 
        style={frameStyle}
        allowFullScreen
      />
    </div>
  );
};

export default OpenCTIFrame;
