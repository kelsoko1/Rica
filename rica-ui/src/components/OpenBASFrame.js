import React from 'react';
import './IframeContainer.css';

const OpenBASFrame = () => {
  const frameStyle = {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: '#fff'
  };

  return (
    <div className="iframe-container" style={{ width: '100%', height: '100%' }}>
      <iframe 
        src="http://localhost:2021" 
        title="OpenBAS" 
        style={frameStyle}
        allowFullScreen
      />
    </div>
  );
};

export default OpenBASFrame;
